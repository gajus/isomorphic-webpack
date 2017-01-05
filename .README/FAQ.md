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

Using `createIsomorphicWebpack` result has a `compiler` property. `compiler` is an instance of a webpack [`Compiler`](https://webpack.github.io/docs/node.js-api.html#compiler). Use it to subscribe to all compiler events, e.g.

Attempting to render a route server-side before the compiler has completed at least one compilation will produce an error. Therefore, it is desirable to delay the first server-side render until the compiler has completed at least one compilation.

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
