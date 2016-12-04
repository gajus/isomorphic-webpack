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
