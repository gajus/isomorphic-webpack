// @flow

import path from 'path';
import isInlineLoader from './isInlineLoader';
import isRequestInRequestMap from './isRequestInRequestMap';
import {
  resolvePath,
  normalizePath
} from './normalizeResourcePath';

/**
 * Tells whether to override a require request.
 */
export default (context: string, requestMap: Object, request: string, parentFilename: string): boolean => {
  const loaderIsInline = isInlineLoader(request);

  // Override request if request path defines a loader, e.g.
  // "url-loader?mimetype=image/png!./file.png"
  if (loaderIsInline) {
    return true;
  }

  const pathIsAbsolute = path.isAbsolute(request);

  if (pathIsAbsolute) {
    return false;
  }

  const absoluteTargetResourcePath = resolvePath(path.dirname(parentFilename), request);
  const contextAbsoluteResourcePath = resolvePath(path.dirname(context));

  // Might need to override resource if the absolute path
  // is within the project context path.
  if (!absoluteTargetResourcePath.startsWith(contextAbsoluteResourcePath)) {
    return false;
  }

  const relativeTargetResourcePath = './' + normalizePath(path.relative(context, absoluteTargetResourcePath));

  // this replace allow isomorphic-webpack to work on Window

  if (isRequestInRequestMap(relativeTargetResourcePath, requestMap)) {
    return true;
  }

  if (isRequestInRequestMap(relativeTargetResourcePath + '.js', requestMap)) {
    return true;
  }

  if (isRequestInRequestMap('./' + normalizePath(path.join(relativeTargetResourcePath, 'index.js')), requestMap)) {
    return true;
  }

  return false;
};
