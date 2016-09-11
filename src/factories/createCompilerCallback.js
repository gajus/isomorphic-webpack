// @flow

import path from 'path';
import {
  Compiler,
  DllPlugin
} from 'webpack';
import createDebug from 'debug';
import createResourceMap from './createResourceMap';
import findInstance from './../utilities/findInstance';

const debug = createDebug('isomorphic-webpack');

export default (compiler: Compiler, callback: Function) => {
  const dllPlugin = findInstance(compiler.options.plugins, DllPlugin);
  const manifestPath = dllPlugin.options.path;

  debug('manifestPath', manifestPath);

  const outputFileSystem = compiler.outputFileSystem;

  return (error) => {
    if (error) {
      debug('compiler error:', error);

      return;
    }

    const manifest = JSON.parse(outputFileSystem.readFileSync(manifestPath));

    debug('manifest', manifest);

    const requestMap = createResourceMap(manifest);

    debug('requestMap', requestMap);

    const entryChunkName = Object.keys(compiler.options.entry)[0];

    debug('entryChunkName', entryChunkName);

    const absoluteEntryChunkName = path.resolve(compiler.options.output.path, entryChunkName + '.js');

    const bundleCode = outputFileSystem.readFileSync(absoluteEntryChunkName, 'utf-8');

    callback({
      bundleCode,
      requestMap
    });
  };
};
