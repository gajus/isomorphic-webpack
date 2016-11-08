<a name="isomorphic-webpack"></a>
# isomorphic-webpack

[![Travis build status](http://img.shields.io/travis/gajus/isomorphic-webpack/master.svg?style=flat-square)](https://travis-ci.org/gajus/isomorphic-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/isomorphic-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/isomorphic-webpack)
[![NPM version](http://img.shields.io/npm/v/isomorphic-webpack.svg?style=flat-square)](https://www.npmjs.org/package/isomorphic-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

<img src='https://cdn.rawgit.com/gajus/isomorphic-webpack/master/.README/isomorphic-webpack.svg' width='176' height='200' alt='isomorphic-webpack' />

Abstracts universal consumption of modules bundled using [webpack](https://github.com/webpack/webpack).

* [isomorphic-webpack](#isomorphic-webpack)
    * [Goals](#isomorphic-webpack-goals)
    * [Try it](#isomorphic-webpack-try-it)
    * [How does it work?](#isomorphic-webpack-how-does-it-work)
    * [Setup](#isomorphic-webpack-setup)
        * [High-level abstraction](#isomorphic-webpack-setup-high-level-abstraction)
        * [Low-level abstraction](#isomorphic-webpack-setup-low-level-abstraction)
    * [Handling errors](#isomorphic-webpack-handling-errors)
    * [FAQ](#isomorphic-webpack-faq)
        * [How to differentiate between Node.js and browser environment?](#isomorphic-webpack-faq-how-to-differentiate-between-node-js-and-browser-environment)
        * [How to enable logging?](#isomorphic-webpack-faq-how-to-enable-logging)


<a name="isomorphic-webpack-goals"></a>
## Goals

* Only one running node process. ✅
* Enables use of all webpack loaders. ✅
* Server side hot reloading of modules. ✅
* [Stack trace support](https://github.com/gajus/isomorphic-webpack/issues/4). ✅

<a name="isomorphic-webpack-try-it"></a>
## Try it

https://github.com/gajus/isomorphic-webpack-boilerplate

<a name="isomorphic-webpack-how-does-it-work"></a>
## How does it work?

Refer to the [Low-level abstraction](#isomorphic-webpack-setup-low-level-abstraction) documentation.

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
type IsomorphicWebpack = {|
	formatErrorStack: Function
|};

createIsomorphicWebpack(webpackConfiguration: Object, isomorphicWebpackConfiguration: Object): IsomorphicWebpack;
```

<a name="isomorphic-webpack-setup-high-level-abstraction-isomorphic-webpack-configuration"></a>
#### Isomorphic webpack configuration

There are no configuration properties available for the high-level abstraction. (I have not identified a need.)

If you have a requirement for configuration, [raise an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=configuration%20request:&body=configuration%20name:%0aconfiguration%20use%20case:%0adefault%20value:).

<!--
```json
{
  "additionalProperties": false,
  "properties": {},
  "type": "object"
}

```
-->

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
-    at TopicIndexContainer (evalmachine.<anonymous>:485:15)
+    at TopicIndexContainer (/src/client/containers/TopicIndexContainer/index.js:14:14)
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
