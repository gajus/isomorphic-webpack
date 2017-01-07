# isomorphic-webpack

[![Travis build status](http://img.shields.io/travis/gajus/isomorphic-webpack/master.svg?style=flat-square)](https://travis-ci.org/gajus/isomorphic-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/isomorphic-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/isomorphic-webpack)
[![NPM version](http://img.shields.io/npm/v/isomorphic-webpack.svg?style=flat-square)](https://www.npmjs.org/package/isomorphic-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

<img src='https://cdn.rawgit.com/gajus/isomorphic-webpack/master/.README/isomorphic-webpack.svg' height='200' alt='isomorphic-webpack' />

Abstracts universal consumption of modules bundled using [webpack](https://github.com/webpack/webpack).

{"gitdown": "contents", "rootId": "isomorphic-webpack", "maxLevel": 5}

## Goals

* Only one running node process. ✅
* Enables use of all webpack loaders. ✅
* Server side hot reloading of modules. ✅
* [Stack trace support](https://github.com/gajus/isomorphic-webpack/issues/4). ✅

## How to get started?

To start the server:

```bash
git clone git@github.com:gajus/isomorphic-webpack-demo.git
cd ./isomorphic-webpack-demo
npm install
export DEBUG=express:application,isomorphic-webpack
npm start
```

This will start the server on http://127.0.0.1:8000/.

## How does it work?

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
type IsomorphicWebpackType = {|
  /**
   * @see https://webpack.github.io/docs/node.js-api.html#compiler
   */
  compiler: Compiler,
  formatErrorStack: Function
|};

createIsomorphicWebpack(webpackConfiguration: Object): IsomorphicWebpackType;
```

#### Isomorphic webpack configuration

There are no configuration properties available for the high-level abstraction. (I have not identified a need.)

If you have a requirement for a configuration, [raise an issue](https://github.com/gajus/isomorphic-webpack/issues/new?title=configuration%20request:&body=configuration%20name:%0aconfiguration%20use%20case:%0adefault%20value:) describing your use case.

<!--
```json
{"gitdown": "include", "file": "./../src/schemas/isomorphicWebpackConfiguration.json"}
```
-->

### Low-level abstraction

{"gitdown": "include", "file": "./LOW-LEVEL_ABSTRACTION.md"}

## Handling errors

{"gitdown": "include", "file": "./HANDLING_ERRORS.md"}

## FAQ

{"gitdown": "include", "file": "./FAQ.md"}
