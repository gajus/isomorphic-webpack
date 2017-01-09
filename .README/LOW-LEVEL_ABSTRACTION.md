> This section of the documentation is included for transparency purposes only.
> If you are planning on using the low-level abstraction, please take time to
> open an issue and discuss your use case. If it is a generic use case,
> I will be happy to add it to the high-level abstraction.

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
