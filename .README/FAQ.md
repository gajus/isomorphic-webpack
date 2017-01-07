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

### How does `isomorphic-webpack` work?

Refer to the [Low-level abstraction](#isomorphic-webpack-setup-low-level-abstraction) documentation.

### How to use webpack `*-loader` loader?

> Loaders allow you to preprocess files as you require() or "load" them. [..] Loaders can transform files from a different language like, CoffeeScript to JavaScript, or inline images as data URLs.

– https://webpack.github.io/docs/loaders.html

`isomorphic-webpack` is simulating the browser environment to evaluate loaders that are designed to run in a browser, e.g. [`style-loader`](https://github.com/webpack/style-loader). Therefore, all webpack loaders work out of the box with `isomorphic-webpack`.

If you have found a loader that does not work, [report an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=[bug]%20loader%20X%20does%20work&body=The%20following%20X%20loader%20configuration%20Y%20is%20producing%20the%20following%20error%20Z.).

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

### How to enable logging?

`isomorphic-webpack` is using [`debug`](https://www.npmjs.com/package/debug) to log messages.

To enable logging, export `DEBUG` environment variable:

```sh
export DEBUG=isomorphic-webpack:*
```

### How to subscribe to compiler events?

Using `createIsomorphicWebpack` result has a `compiler` property. `compiler` is an instance of a webpack [`Compiler`](https://webpack.github.io/docs/node.js-api.html#compiler). Use it to subscribe to all compiler events.

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

### What makes `isomorphic-webpack` different from `webpack-isomorphic-tools`, `universal-webpack`, ...?

|Feature|`isomorphic-webpack`|[`webpack-isomorphic-tools`](https://github.com/halt-hammerzeit/webpack-isomorphic-tools)|[`universal-webpack`](https://github.com/halt-hammerzeit/universal-webpack)|
|---|---|---|---|
|Only one running node process.|✅|❌|❌|
|Does not require a separate webpack configuration.|✅|❌|❌|
|Enables use of all webpack loaders.|✅|❌|❌|
|Server-side hot reloading of modules.|✅|✅|✅|
|Supports stack trace.|✅|❌|❌|
|Prevents serving stale data.|✅|❌|❌|
|Overrides Node.js `require()`.|✅|✅|❌|
|Uses webpack [`target: "node"`](https://webpack.github.io/docs/configuration.html#target).|❌|❌|✅|
|Provides [low-level API](https://github.com/gajus/isomorphic-webpack#isomorphic-webpack-setup-low-level-abstraction).|✅|❌|❌|

From a subjective perspective, `isomorphic-webpack` is a lot easier to setup than any of the existing alternatives.

> I apologise in advance if I have misrepresented either of the frameworks.
>
> Contact me to correct an error in the above comparison table, if you'd like to
> add another comparison criteria, or to add another framework.

### I thought we agreed to use the term "universal"?

> TL;DR: **Isomorphism** is the functional aspect of seamlessly switching between client- and server-side rendering without losing state. **Universal** is a term used to emphasize the fact that a particular piece of JavaScript code is able to run in multiple environments.

– https://medium.com/@ghengeveld/isomorphism-vs-universal-javascript-4b47fb481beb#.h7fikpuyk

`isomorphic-webpack` is a program that runs server-side and enables rendering of the same code base client- and server-side.
