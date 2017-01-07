# isomorphic-webpack

[![Travis build status](http://img.shields.io/travis/gajus/isomorphic-webpack/master.svg?style=flat-square)](https://travis-ci.org/gajus/isomorphic-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/isomorphic-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/isomorphic-webpack)
[![NPM version](http://img.shields.io/npm/v/isomorphic-webpack.svg?style=flat-square)](https://www.npmjs.org/package/isomorphic-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

<img src='https://cdn.rawgit.com/gajus/isomorphic-webpack/master/.README/isomorphic-webpack.svg' height='200' alt='isomorphic-webpack' />

Abstracts universal consumption of modules bundled using [webpack](https://github.com/webpack/webpack).

## Goals

* Only one running node process. ✅
* Does not require a separate webpack configuration. ✅
* [Enables use of all webpack loaders.](#isomorphic-webpack-faq-how-to-use-webpack-loader-loader) ✅
* [Server-side hot reloading of modules](#how-does-the-hot-reloading-work). ✅
* [Stack trace support](https://github.com/gajus/isomorphic-webpack/issues/4). ✅
* [Prevent serving stale data](#how-to-delay-request-handling-while-compilation-is-in-progress). ✅

---

## Table of contents

{"gitdown": "contents", "rootId": "isomorphic-webpack", "maxLevel": 5}

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

#### Isomorphic webpack configuration

```json
{"gitdown": "include", "file": "./../src/schemas/isomorphicWebpackConfigurationSchema.json"}
```

If you have a requirement for a configuration, [raise an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=configuration%20request:&body=configuration%20name:%0aconfiguration%20use%20case:%0adefault%20value:) describing your use case.

### Low-level abstraction

{"gitdown": "include", "file": "./LOW-LEVEL_ABSTRACTION.md"}

## Handling errors

{"gitdown": "include", "file": "./HANDLING_ERRORS.md"}

## FAQ

{"gitdown": "include", "file": "./FAQ.md"}
