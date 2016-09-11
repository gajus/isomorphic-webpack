// @flow

import path from 'path';
import {
  DllPlugin
} from 'webpack';
import nodeExternals from 'webpack-node-externals';
import webpackMerge from 'webpack-merge';

export default (webpackConfiguration: Object): Object => {
  const manifestPath = path.resolve(webpackConfiguration.context, 'manifest.json');

  const compilerConfiguration = webpackMerge(webpackConfiguration, {
    externals: [
      nodeExternals({
        importType: 'commonjs2'
      })
      // @todo
      //
      // Relative resources are not being resolved, because 'require'
      // is relative to the path of the 'overrideRequire' and not to
      // the path of the original resource.
      //
      // @see https://github.com/liady/webpack-node-externals/issues/14
      // (context, request, callback) => {
      //   if (request.includes('node_modules')) {
      //     callback(null, 'require("' + request + '")');
      //     return;
      //   }
      //   callback();
      // }
    ],
    plugins: [
      new DllPlugin({
        path: manifestPath
      })
    ],
    target: 'node'
  });

  return compilerConfiguration;
};
