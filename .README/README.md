# isomorphic-webpack

[![Travis build status](http://img.shields.io/travis/gajus/isomorphic-webpack/master.svg?style=flat-square)](https://travis-ci.org/gajus/isomorphic-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/isomorphic-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/isomorphic-webpack)
[![NPM version](http://img.shields.io/npm/v/isomorphic-webpack.svg?style=flat-square)](https://www.npmjs.org/package/isomorphic-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

Abstracts universal consumption of modules bundled using [webpack](https://github.com/webpack/webpack).

{"gitdown": "contents"}

## Goals

* Only one running node process. ✅
* Enables use of all webpack loaders. ✅
* Server side hot reloading of modules. ✅

## Try it

https://github.com/gajus/isomorphic-webpack-boilerplate

#### How does it work?

Refer to the [Low-level abstraction](#isomorphic-webpack-setup-low-level-abstraction) documentation.

## Setup

### High-level abstraction

```js
import {
	createIsomorphicWebpack
} from 'isomorphic-webpack';
import webpackConfiguration from './webpack.configuration';

createIsomorphicWebpack(webpackConfiguration);
```

#### API

```js
createIsomorphicWebpack(webpackConfiguration: Object, isomorphicWebpackConfiguration: Object): void;
```

#### Isomorphic webpack configuration

There are no configuration properties available for the high-level abstraction. (I have not identified a need.)

If you have a requirement for configuration, [raise an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=configuration%20request:&body=configuration%20name:%0aconfiguration%20use%20case:%0adefault%20value:).

<!--
```json
{"gitdown": "include", "file": "./../src/schemas/isomorphicWebpackConfiguration.json"}
```
-->

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

## FAQ

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
