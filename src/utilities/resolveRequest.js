// @flow

import path from 'path';
import enhancedResolve from 'enhanced-resolve';
import isRequestInRequestMap from './isRequestInRequestMap';

const resolveLoaderSync = enhancedResolve.loader.sync;

export default (context: string, requestMap: Object, request: string, parentFilename: string): any => {
  const loaders = request.split('!');
  const requestFilePath = loaders.pop();

  const resolvedLoaders = loaders
    .map((loader: string): string => {
      // @todo What is the purpose of the context parameter?
      return resolveLoaderSync({}, parentFilename, loader);
    })
    .map((loaderAbsolutePath: string): string => {
      return path.relative(context, loaderAbsolutePath);
    });

  const absoluteRequestPath = path.resolve(path.dirname(parentFilename), requestFilePath);
  const relativeTargetResourcePath = './' + path.relative(context, absoluteRequestPath);

  const relativeTargetResourcePathWithLoaders = resolvedLoaders.concat([relativeTargetResourcePath]).join('!');

  if (isRequestInRequestMap(relativeTargetResourcePathWithLoaders, requestMap)) {
    return relativeTargetResourcePathWithLoaders;
  }

  if (isRequestInRequestMap(relativeTargetResourcePathWithLoaders + '.js', requestMap)) {
    return relativeTargetResourcePathWithLoaders + '.js';
  }

  if (isRequestInRequestMap('./' + path.join(relativeTargetResourcePathWithLoaders, 'index.js'), requestMap)) {
    return './' + path.join(relativeTargetResourcePathWithLoaders, 'index.js');
  }

  throw new Error('Cannot resolve the request.');
};
