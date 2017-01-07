<a name="isomorphic-webpack"></a>
# isomorphic-webpack

[![Travis build status](http://img.shields.io/travis/gajus/isomorphic-webpack/master.svg?style=flat-square)](https://travis-ci.org/gajus/isomorphic-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/isomorphic-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/isomorphic-webpack)
[![NPM version](http://img.shields.io/npm/v/isomorphic-webpack.svg?style=flat-square)](https://www.npmjs.org/package/isomorphic-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

<img src='https://cdn.rawgit.com/gajus/isomorphic-webpack/master/.README/isomorphic-webpack.svg' height='200' alt='isomorphic-webpack' />

Abstracts universal consumption of modules bundled using [webpack](https://github.com/webpack/webpack).

<a name="isomorphic-webpack-goals"></a>
## Goals

* Only one running node process. ✅
* Does not require a separate webpack configuration. ✅
* [Enables use of all webpack loaders](#isomorphic-webpack-faq-how-to-use-webpack-loader-loader). ✅
* [Server-side hot reloading of modules](#how-does-the-hot-reloading-work). ✅
* [Stack trace support](https://github.com/gajus/isomorphic-webpack/issues/4). ✅
* [Prevent serving stale data](#how-to-delay-request-handling-while-compilation-is-in-progress). ✅

---

<a name="isomorphic-webpack-table-of-contents"></a>
## Table of contents

* [Goals](#isomorphic-webpack-goals)
* [Table of contents](#isomorphic-webpack-table-of-contents)
* [Setup](#isomorphic-webpack-setup)
    * [High-level abstraction](#isomorphic-webpack-setup-high-level-abstraction)
        * [API](#isomorphic-webpack-setup-high-level-abstraction-api)
        * [Isomorphic webpack configuration](#isomorphic-webpack-setup-high-level-abstraction-isomorphic-webpack-configuration)
    * [Low-level abstraction](#isomorphic-webpack-setup-low-level-abstraction)
* [Handling errors](#isomorphic-webpack-handling-errors)
* [FAQ](#isomorphic-webpack-faq)
    * [How to get started?](#isomorphic-webpack-faq-how-to-get-started)
    * [How does `isomorphic-webpack` work?](#isomorphic-webpack-faq-how-does-isomorphic-webpack-work)
    * [How to use webpack `*-loader` loader?](#isomorphic-webpack-faq-how-to-use-webpack-loader-loader)
    * [How does the hot-reloading work?](#isomorphic-webpack-faq-how-does-the-hot-reloading-work)
    * [How to differentiate between Node.js and browser environment?](#isomorphic-webpack-faq-how-to-differentiate-between-node-js-and-browser-environment)
    * [How to enable logging?](#isomorphic-webpack-faq-how-to-enable-logging)
    * [How to subscribe to compiler events?](#isomorphic-webpack-faq-how-to-subscribe-to-compiler-events)
    * [How to delay route initialisation until the first successful compilation?](#isomorphic-webpack-faq-how-to-delay-route-initialisation-until-the-first-successful-compilation)
    * [How to delay request handling while compilation is in progress?](#isomorphic-webpack-faq-how-to-delay-request-handling-while-compilation-is-in-progress)
    * [What makes `isomorphic-webpack` different from `webpack-isomorphic-tools`, `universal-webpack`, ...?](#isomorphic-webpack-faq-what-makes-isomorphic-webpack-different-from-webpack-isomorphic-tools-universal-webpack)


<a name="isomorphic-webpack-setup"></a>
## Setup

<a name="isomorphic-webpack-setup-high-level-abstraction"></a>
### High-level abstraction

```js
import {
	createIsomorphicWebpack
} from 'isomorphic-webpack';
import webpackConfiguration from './webpack.configuration';

createIsomorphicWebpack(webpackConfiguration);

```

<a name="isomorphic-webpack-setup-high-level-abstraction-api"></a>
#### API

```js
/**
 * @see https://webpack.js.org/configuration/
 */
type WebpackConfigurationType = Object;

/**
 * @see https://github.com/gajus/gitdown#isomorphic-webpack-setup-high-level-abstraction-isomorphic-webpack-configuration
 */
type UserIsomorphicWebpackConfigurationType = {
  useCompilationPromise?: boolean
};

type IsomorphicWebpackType = {|
  /**
   * @see https://webpack.github.io/docs/node.js-api.html#compiler
   */
  +compiler: Compiler,
  +formatErrorStack: Function
|};

createIsomorphicWebpack(webpackConfiguration: WebpackConfigurationType, isomorphicWebpackConfiguration: UserIsomorphicWebpackConfigurationType): IsomorphicWebpackType;

```

<a name="isomorphic-webpack-setup-high-level-abstraction-isomorphic-webpack-configuration"></a>
#### Isomorphic webpack configuration

```json
{
  "additionalProperties": false,
  "properties": {
    "useCompilationPromise": {
      "description": "Toggles compilation observer. Enable this feature to use `createCompilationPromise`.",
      "type": "boolean"
    }
  },
  "type": "object"
}

```

If you have a requirement for a configuration, [raise an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=configuration%20request:&body=configuration%20name:%0aconfiguration%20use%20case:%0adefault%20value:) describing your use case.

<a name="isomorphic-webpack-setup-low-level-abstraction"></a>
### Low-level abstraction

```js
import {
  createCompiler,
  createCompilerCallback,
  createCompilerConfiguration,
  isRequestResolvable,
  resolveRequest,
  runCode
} from 'isomorphic-webpack';
import overrideRequire from 'override-require';

export default (webpackConfiguration) => {
  // Use existing webpack configuration to create a new configuration
  // that enables DllPlugin (Dynamically Linked Library) plugin.
  const compilerConfiguration = createCompilerConfiguration(webpackConfiguration);

  // Create a webpack compiler that uses in-memory file system.
  //
  // The sole purpose of using in-memory file system is to avoid
  // the overhead of disk write.
  const compiler = createCompiler(compilerConfiguration);

  let restoreOriginalRequire;

  // Create a callback for the consumption of the compiler.
  //
  // The callback function provided to the `createCompilerCallback`
  // is invoked on each successful compilation.
  //
  // `createCompilerCallback` callback is invoked with an object
  // that describes the resulting bundle code and a map of modules.
  const compilerCallback = createCompilerCallback(compiler, ({bundleCode, requestMap}) => {
  // Execute the code in the bundle.
    const webpackRequire = runCode(bundleCode);

    // Setup a callback used to determine whether a specific `require` invocation
    // needs to be overridden.
    const isOverride = (request, parent) => {
      return isRequestResolvable(compiler.options.context, requestMap, request, parent.filename);
    };

    // Setup a callback used to override `require` invocation.
    const resolveOverride = (request, parent) => {
    	// Map request to the module ID.
      const matchedRequest = resolveRequest(compiler.options.context, requestMap, request, parent.filename);
      const moduleId = requestMap[matchedRequest];

      return webpackRequire(moduleId);
    };

    if (restoreOriginalRequire) {
      restoreOriginalRequire();
    }

    // Setup
    restoreOriginalRequire = overrideRequire(isOverride, resolveOverride);
  });

  compiler.watch({}, compilerCallback);
};
```


<a name="isomorphic-webpack-handling-errors"></a>
## Handling errors

When a runtime error originates in a bundle, the stack trace refers to the code executed in the bundle ([#4](https://github.com/gajus/isomorphic-webpack/issues/4)).

Use [`formatErrorStack`](#api) to replace references to the VM code with the references resolved using the sourcemap, e.g.

```js
const {
  formatErrorStack
} = createIsomorphicWebpack(webpackConfiguration);

app.get('*', isomorphicMiddleware);

app.use((err, req, res, next) => {
  console.error(formatErrorStack(err.stack));
});
```

```diff
ReferenceError: props is not defined
-   at TopicIndexContainer (evalmachine.<anonymous>:485:15)
+   at TopicIndexContainer (/src/client/containers/TopicIndexContainer/index.js:14:14)
    at WrappedComponent (/node_modules/react-css-modules/dist/wrapStatelessFunction.js:55:38)
    at /node_modules/react-dom/lib/ReactCompositeComponent.js:306:16
    at measureLifeCyclePerf (/node_modules/react-dom/lib/ReactCompositeComponent.js:75:12)
    at ReactCompositeComponentWrapper._constructComponentWithoutOwner (/node_modules/react-dom/lib/ReactCompositeComponent.js:305:14)
    at ReactCompositeComponentWrapper._constructComponent (/node_modules/react-dom/lib/ReactCompositeComponent.js:280:21)
    at ReactCompositeComponentWrapper.mountComponent (/node_modules/react-dom/lib/ReactCompositeComponent.js:188:21)
    at Object.mountComponent (/node_modules/react-dom/lib/ReactReconciler.js:46:35)
    at /node_modules/react-dom/lib/ReactServerRendering.js:45:36
    at ReactServerRenderingTransaction.perform (/node_modules/react-dom/lib/Transaction.js:140:20)
```

Note: References to a generated code that cannot be resolved in a source map are ignored ([#5](https://github.com/gajus/isomorphic-webpack/issues/5)).


<a name="isomorphic-webpack-faq"></a>
## FAQ

<a name="isomorphic-webpack-faq-how-to-get-started"></a>
### How to get started?

The easiest way to start is to analyse the demo application.

To start the server:

```bash
git clone git@github.com:gajus/isomorphic-webpack-demo.git
cd ./isomorphic-webpack-demo
npm install
export DEBUG=express:application,isomorphic-webpack
npm start
```

This will start the server on http://127.0.0.1:8000/.

```bash
open http://127.0.0.1:8000/
```

<a name="isomorphic-webpack-faq-how-does-isomorphic-webpack-work"></a>
### How does <code>isomorphic-webpack</code> work?

Refer to the [Low-level abstraction](#isomorphic-webpack-setup-low-level-abstraction) documentation.

<a name="isomorphic-webpack-faq-how-to-use-webpack-loader-loader"></a>
### How to use webpack <code>*-loader</code> loader?

> Loaders allow you to preprocess files as you require() or "load" them. [..] Loaders can transform files from a different language like, CoffeeScript to JavaScript, or inline images as data URLs.

– https://webpack.github.io/docs/loaders.html

`isomorphic-webpack` is simulating the browser environment to evaluate loaders that are designed to run in a browser, e.g. [`style-loader`](https://github.com/webpack/style-loader). Therefore, all webpack loaders work out of the box with `isomorphic-webpack`.

If you have found a loader that does not work, [report an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=[bug]%20loader%20X%20does%20work&body=The%20following%20X%20loader%20configuration%20Y%20is%20producing%20the%20following%20error%20Z.).

<a name="isomorphic-webpack-faq-how-does-the-hot-reloading-work"></a>
### How does the hot-reloading work?

I have been asked a question:

> I have setup https://github.com/gajus/isomorphic-webpack-demo and
> navigated to http://127.0.0.1:8000/. It printed 'Hello, World!'.
>
> Then I have changed `./src/app/index.js` to say `Hello, HRM!`.
> I was expecting the message 'Hello, World!' to change to 'Hello, HMR!'
> in the already open browser window. However, it didn't.
>
> The message changed to 'Hello, HRM!' only after I have refreshed the browser window.
>
> How is this hot-reloading?

I have used the term "hot-reloading" to describe a process where the webpack
bundle is rebuilt every time a file in the project changes. The change will be
visible on the next HTTP request.

It is "hot-reloading" in a sense that you do not need to restart the HTTP
server every time you make a change to the application.

There is no logic that would force-refresh the page on completion of the compilation.
There are several ways to achieve this, e.g. using a custom script that queries the backend.
However, this does logic does not belong in `isomorphic-webpack`.

The purpose of the server-side rendering is to generate HTML response to a HTTP request.
`isomorphic-webpack` does perform hot-reloading that satisfies this use case.

The primary purpose of hot module reloading (HRM) is to enable better
developer experience. Given that it is a development feature, it is safe to assume
that the developer is in control over the development environment.
Therefore, to achieve HMR you need to implement the logic in your frontend application
and configure webpack as described in the [Hot module replacement with webpack](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack) guide.

<a name="isomorphic-webpack-faq-how-to-differentiate-between-node-js-and-browser-environment"></a>
### How to differentiate between Node.js and browser environment?

Check for presence of `ISOMORPHIC_WEBPACK` variable.

Presence of `ISOMORPHIC_WEBPACK` indicates that code is executed using Node.js.

```js
if (typeof ISOMORPHIC_WEBPACK === 'undefined') {
	// Browser
} else {
	// Node.js
}
```

<a name="isomorphic-webpack-faq-how-to-enable-logging"></a>
### How to enable logging?

`isomorphic-webpack` is using [`debug`](https://www.npmjs.com/package/debug) to log messages.

To enable logging, export `DEBUG` environment variable:

```sh
export DEBUG=isomorphic-webpack:*
```

<a name="isomorphic-webpack-faq-how-to-subscribe-to-compiler-events"></a>
### How to subscribe to compiler events?

Using `createIsomorphicWebpack` result has a `compiler` property. `compiler` is an instance of a webpack [`Compiler`](https://webpack.github.io/docs/node.js-api.html#compiler). Use it to subscribe to all compiler events.

<a name="isomorphic-webpack-faq-how-to-delay-route-initialisation-until-the-first-successful-compilation"></a>
### How to delay route initialisation until the first successful compilation?

See also:

* [How to delay request handling while compilation is in progress?](#isomorphic-webpack-faq-how-to-delay-request-handling-while-compilation-is-in-progress)

Attempting to render a route server-side before the compiler has completed at least one compilation will produce an error, e.g.

```diff
+SyntaxError: /src/app/style.css: Unexpected token (1:0)
+> 1 | .greetings {
+    | ^
+  2 |   font-weight: bold;
+  3 | }
+  4 |
    at Parser.pp$5.raise (/node_modules/babylon/lib/index.js:4246:13)
    at Parser.pp.unexpected (/node_modules/babylon/lib/index.js:1627:8)
    at Parser.pp$3.parseExprAtom (/node_modules/babylon/lib/index.js:3586:12)
    at Parser.parseExprAtom (/node_modules/babylon/lib/index.js:6402:22)
    at Parser.pp$3.parseExprSubscripts (/node_modules/babylon/lib/index.js:3331:19)
    at Parser.pp$3.parseMaybeUnary (/node_modules/babylon/lib/index.js:3311:19)
    at Parser.pp$3.parseExprOps (/node_modules/babylon/lib/index.js:3241:19)
    at Parser.pp$3.parseMaybeConditional (/node_modules/babylon/lib/index.js:3218:19)
    at Parser.pp$3.parseMaybeAssign (/node_modules/babylon/lib/index.js:3181:19)
    at Parser.parseMaybeAssign (/node_modules/babylon/lib/index.js:5694:20)
```

The error will vary depending on what loaders your application code depends on.

Therefore, it is desirable to delay the first server-side render until the compiler has completed at least one compilation.

```js
const {
  compiler
} = createIsomorphicWebpack(webpackConfiguration);

let routesAreInitialized;

compiler.plugin('done', () => {
  if (routesAreInitialized) {
    return;
  }

  routesAreInitialized = true;

  app.get('/', isomorphicMiddleware);
});

```

This pattern is demonstrated in the [isomorphic-webpack-demo](https://github.com/gajus/isomorphic-webpack-demo/blob/master/src/bin/server.js#L29-L43).

<a name="isomorphic-webpack-faq-how-to-delay-request-handling-while-compilation-is-in-progress"></a>
### How to delay request handling while compilation is in progress?

See also:

* [How to delay route initialisation until the first successful compilation?](#isomorphic-webpack-faq-how-to-delay-route-initialisation-until-the-first-successful-compilation)

> WARNING!
>
> Do not use this in production. This implementation has a large overhead.

It might be desirable to stall HTTP request handling until whatever in-progress compilation has completed.
This ensures that during the development you do not receive a stale response.

To achieve this:

* Enable compilation observer using `useCompilationPromise` configuration.
* Use `createCompilationPromise` to create a promise that resolves when a current compilation completes.
* Use the resulting promise to create a middleware that queues all HTTP requests until the promise is resolved.

> Note:
>
> You must enable this feature using `useCompilationPromise` configuration.
>
> If you use `createCompilationPromise` without configuring `useCompilationPromise`,
> you will get an error:
>
> "createCompilationPromise" feature has not been enabled.

Example usage:

```js
const {
  createCompilationPromise
} = createIsomorphicWebpack(webpackConfiguration, {
  useCompilationPromise: true
});

app.use(async (req, res, next) => {
  await createCompilationPromise();

  next();
});

app.get('/', isomorphicMiddleware);

```

<a name="isomorphic-webpack-faq-what-makes-isomorphic-webpack-different-from-webpack-isomorphic-tools-universal-webpack"></a>
### What makes <code>isomorphic-webpack</code> different from <code>webpack-isomorphic-tools</code>, <code>universal-webpack</code>, ...?

|Feature|`isomorphic-webpack`|[`webpack-isomorphic-tools`](https://github.com/halt-hammerzeit/webpack-isomorphic-tools)|[`universal-webpack`](https://github.com/halt-hammerzeit/universal-webpack)|
|---|---|---|---|
|Only one running node process.|✅|❌|❌|
|Does not require a separate webpack configuration.|✅|❌|❌|
|Enables use of all webpack loaders.|✅|❌|❌|
|Server-side hot reloading of modules.|✅|✅|✅|
|Supports stack trace.|✅|❌|❌|
|Prevents serving stale data.|✅|❌|❌|
|Overrides Node.js `require()`.|✅|✅|❌|
|Uses webpack `target: "node"`.|❌|❌|✅|

From a subjective perspective, `isomorphic-webpack` is a lot easier to setup than any of the existing alternatives.

> I apologise in advance if I have misrepresented either of the frameworks.
>
> Contact me to correct an error in the above comparison table, if you'd like to
> add another comparison criteria, or to add another framework.

