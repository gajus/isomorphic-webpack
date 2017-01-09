# isomorphic-webpack

[![Travis build status](http://img.shields.io/travis/gajus/isomorphic-webpack/master.svg?style=flat-square)](https://travis-ci.org/gajus/isomorphic-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/isomorphic-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/isomorphic-webpack)
[![NPM version](http://img.shields.io/npm/v/isomorphic-webpack.svg?style=flat-square)](https://www.npmjs.org/package/isomorphic-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

<img src='https://cdn.rawgit.com/gajus/isomorphic-webpack/master/.README/isomorphic-webpack.svg' height='200' alt='isomorphic-webpack' />

`isomorphic-webpack` is a program that runs server-side and enables rendering of the same code base client- and server-side.

Put it another way, it is a service for rendering webpack applications server-side. All that can be rendered client-side (e.g. React, Angular, etc. applications) will be processed server-side and served as static HTML.

Try it!

```bash
git clone git@github.com:gajus/isomorphic-webpack-demo.git
cd ./isomorphic-webpack-demo
npm install
export DEBUG=express:application,isomorphic-webpack
npm start
```

This will start the server on http://127.0.0.1:8000/.

```bash
$ curl http://127.0.0.1:8000/

<!doctype html>
<html>
  <head></head>
  <body>
    <div id='app'>
      <div class="app-___style___greetings" data-reactroot="" data-reactid="1" data-react-checksum="72097819">Hello, World!</div>
    </div>

    <script src='/static/app.js'></script>
  </body>
</html>
```

## Goals

* Only one running node process. ✅
* Does not require a separate webpack configuration. ✅
* [Enables use of all webpack loaders](#isomorphic-webpack-faq-how-to-use-webpack-loader-loader). ✅
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
  +evalCode: Function,
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
