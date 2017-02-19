> This section of the documentation is included for transparency purposes only.
>
> If you are planning on using the low-level abstraction, please take time to
> open an issue and discuss your use case. If it is a generic use case,
> I will be happy to add it to the high-level abstraction.

This is a stripped-down version of [`./../src/factories/createIsomorphicWebpack.js`](./../src/factories/createIsomorphicWebpack.js).

```js
import {
  createCompiler,
  createCompilerCallback,
  createCompilerConfiguration,
  evalCodeInBrowser
} from 'isomorphic-webpack';

export default (webpackConfiguration) => {
  // Use existing webpack configuration to create a new configuration
  // that enables DllPlugin (Dynamically Linked Library) plugin.
  const compilerConfiguration = createCompilerConfiguration(webpackConfiguration);

  // Create a webpack compiler that uses in-memory file system.
  //
  // The sole purpose of using in-memory file system is to avoid
  // the overhead of disk write.
  const compiler = createCompiler(compilerConfiguration);

  let currentBundleCode;
  let currentRequestMap;

  // Create a callback for the consumption of the compiler.
  //
  // The callback function provided to the `createCompilerCallback`
  // is invoked on each successful compilation.
  //
  // `createCompilerCallback` callback is invoked with an object
  // that describes the resulting bundle code and a map of modules.
  const compilerCallback = createCompilerCallback(compiler, ({bundleCode, requestMap}) => {
    currentBundleCode = bundleCode;
    currentRequestMap = requestMap;
  });

  // Create a method used to evaluate the bundle code.
  const evalBundleCode = () => {
    // We evaluate the bundle code in "browser" and retrieve
    // a method used to require individual modules.
    const requireModule = evalCodeInBrowser(currentBundleCode);

    // For the purpose of the demonstration, we are assuming that the entry
    // module ID is 0. This is not always the case.
    const moduleId = 0;

    // We require the the module and returned the evaluated code.
    return requireModule(moduleId);
  };

  compiler.watch({}, compilerCallback);

  return {
    evalBundleCode
  };
};

```
