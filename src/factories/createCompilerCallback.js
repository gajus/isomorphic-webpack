// @flow

import path from 'path';
import {
  Compiler,
  DllPlugin
} from 'webpack';
import createDebug from 'debug';
import findInstance from '../utilities/findInstance';
import createResourceMap from './createResourceMap';

const debug = createDebug('isomorphic-webpack');

export default (compiler: Compiler, callback: Function): Function => {
  const dllPlugin = findInstance(compiler.options.plugins, DllPlugin);
  const manifestPath = dllPlugin.options.path;

  debug('manifestPath', manifestPath);

  const outputFileSystem = compiler.outputFileSystem;

  return (error: Object, stats: Object) => {
    if (error) {
      debug('compiler error:', error);

      return;
    }

    if (stats.compilation.errors.length) {
      debug('compilation error', stats.compilation.errors);

      return;
    }

    if (stats.compilation.missingDependencies.length) {
      debug('aborting compilation; missing dependencies', stats.compilation.missingDependencies);

      return;
    }

    const manifest = JSON.parse(outputFileSystem.readFileSync(manifestPath));

    debug('manifest', manifest);

    const requestMap = createResourceMap(manifest.content);

    debug('requestMap', requestMap);

    let entryChunkName;

    if (Array.isArray(compiler.options.entry)) {
      entryChunkName = 'main';
    } else {
      const bundleNames = Object.keys(compiler.options.entry);

      if (bundleNames.length === 0) {
        throw new Error('Invalid "entry" configuration.');
      } else if (bundleNames.length > 1) {
        // eslint-disable-next-line no-console
        console.log('Multiple bundles are not supported. See https://github.com/gajus/isomorphic-webpack/issues/10.');

        throw new Error('Unsupported "entry" configuration.');
      }

      entryChunkName = bundleNames[0];
    }

    let formattedOutputName = entryChunkName;

    if (compiler && compiler.options && compiler.options.output && compiler.options.output.filename) {
      formattedOutputName = compiler.options.output.filename.replace('[name]', entryChunkName);
    }

    const absoluteEntryChunkName = path.resolve(compiler.options.output.path, formattedOutputName);

    debug('absoluteEntryChunkName', absoluteEntryChunkName);
    const bundleCode = outputFileSystem.readFileSync(absoluteEntryChunkName, 'utf-8');

    const bundleSourceMap = JSON.parse(outputFileSystem.readFileSync(absoluteEntryChunkName + '.map', 'utf-8'));

    callback({
      bundleCode,
      bundleSourceMap,
      requestMap
    });
  };
};
