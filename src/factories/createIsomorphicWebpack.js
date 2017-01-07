// @flow

import {
  Compiler
} from 'webpack';
import overrideRequire from 'override-require';
import {
  SourceMapConsumer
} from 'source-map';
import createDebug from 'debug';
import type {
  UserIsomorphicWebpackConfigurationType
} from '../types';
import isRequestResolvable from '../utilities/isRequestResolvable';
import resolveRequest from '../utilities/resolveRequest';
import runCode from '../utilities/runCode';
import createCompiler from './createCompiler';
import createCompilerCallback from './createCompilerCallback';
import createCompilerConfiguration from './createCompilerConfiguration';
import createIsomorphicWebpackConfiguration from './createIsomorphicWebpackConfiguration';

const debug = createDebug('isomorphic-webpack');

type IsomorphicWebpackType = {|

  /**
   * @see https://webpack.github.io/docs/node.js-api.html#compiler
   */
  compiler: Compiler,
  createCompilationPromise: Function,
  formatErrorStack: Function
|};

type ErrorPositionType = {|
  column: number,
  line: number,
  source: string
|};

export default (webpackConfiguration: Object, userIsomorphicWebpackConfiguration?: UserIsomorphicWebpackConfigurationType): IsomorphicWebpackType => {
  const isomorphicWebpackConfiguration = createIsomorphicWebpackConfiguration(userIsomorphicWebpackConfiguration);
  const compilerConfiguration = createCompilerConfiguration(webpackConfiguration);
  const compiler = createCompiler(compilerConfiguration);

  let createCompilationPromise;

  /**
   * @see https://github.com/gajus/isomorphic-webpack#isomorphic-webpack-faq-how-to-delay-request-handling-while-compilation-is-in-progress
   */
  if (isomorphicWebpackConfiguration.useCompilationPromise) {
    let compilationPromise;
    let compilationPromiseResolve;
    let compilationPromiseIsResolved = true;

    createCompilationPromise = () => {
      return compilationPromise;
    };

    compiler.plugin('compile', () => {
      debug('compiler event: compile (compilationPromiseIsResolved: %s)', compilationPromiseIsResolved);

      if (!compilationPromiseIsResolved) {
        return;
      }

      compilationPromiseIsResolved = false;

      compilationPromise = new Promise((resolve) => {
        compilationPromiseResolve = resolve;
      });
    });

    compiler.plugin('done', () => {
      debug('compiler event: done');

      compilationPromiseIsResolved = true;

      compilationPromiseResolve();
    });
  } else {
    createCompilationPromise = () => {
      throw new Error('"createCompilationPromise" feature has not been enabled.');
    };
  }

  let restoreOriginalRequire;
  let bundleSourceMapConsumer;

  const compilerCallback = createCompilerCallback(compiler, ({
    bundleCode,
    bundleSourceMap,
    requestMap
  }) => {
    bundleSourceMapConsumer = new SourceMapConsumer(bundleSourceMap);

    const module = runCode(bundleCode);

    const isOverride = (request, parent) => {
      const override = isRequestResolvable(compiler.options.context, requestMap, request, parent.filename);

      if (override) {
        const matchedRequest = resolveRequest(compiler.options.context, requestMap, request, parent.filename);

        if (isomorphicWebpackConfiguration.isRequireOverride && !isomorphicWebpackConfiguration.isRequireOverride(matchedRequest)) {
          return false;
        }
      }

      return override;
    };

    const resolveOverride = (request, parent) => {
      const matchedRequest = resolveRequest(compiler.options.context, requestMap, request, parent.filename);
      const moduleId = requestMap[matchedRequest];

      return module(moduleId);
    };

    if (restoreOriginalRequire) {
      restoreOriginalRequire();
    }

    restoreOriginalRequire = overrideRequire(isOverride, resolveOverride);
  });

  compiler.watch({}, compilerCallback);

  const isOriginalPositionDiscoverable = (lineNumber: number, columnNumber: number): boolean => {
    const originalPosition = bundleSourceMapConsumer.originalPositionFor({
      column: columnNumber,
      line: lineNumber
    });

    return originalPosition.source !== null && originalPosition.line !== null && originalPosition.column !== null;
  };

  const getOriginalPosition = (lineNumber: number, columnNumber: number): ErrorPositionType => {
    const originalPosition = bundleSourceMapConsumer.originalPositionFor({
      column: columnNumber,
      line: lineNumber
    });

    return {
      column: originalPosition.column,
      line: originalPosition.line,
      source: originalPosition.source.replace('webpack://', webpackConfiguration.context)
    };
  };

  const formatErrorStack = (errorStack: string): string => {
    return errorStack.replace(/\(isomorphic-webpack:(\d+):(\d+)\)/g, (match, lineNumber, columnNumber) => {
      const targetLineNumber = Number(lineNumber);
      const targetColumnNumber = Number(columnNumber);

      if (!isOriginalPositionDiscoverable(targetLineNumber, targetColumnNumber)) {
        return match;
      }

      const originalPosition = getOriginalPosition(targetLineNumber, targetColumnNumber);

      return '(' + originalPosition.source + ':' + originalPosition.line + ':' + originalPosition.column + ')';
    });
  };

  return {
    compiler,
    createCompilationPromise,
    formatErrorStack
  };
};
