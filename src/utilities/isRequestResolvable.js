// @flow

import path from 'path';
import isInlineLoader from './isInlineLoader';
import isRequestInRequestMap from './isRequestInRequestMap';

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

  const absoluteTargetResourcePath = path.resolve(path.dirname(parentFilename), request);

  // Might need to override resource if the absolute path
  // is within the project context path.
  if (!absoluteTargetResourcePath.startsWith(context)) {
    return false;
  }

  const relativeTargetResourcePath = './' + path.relative(context, absoluteTargetResourcePath);

  if (isRequestInRequestMap(relativeTargetResourcePath, requestMap)) {
    return true;
  }

  if (isRequestInRequestMap(relativeTargetResourcePath + '.js', requestMap)) {
    return true;
  }

  if (isRequestInRequestMap('./' + path.join(relativeTargetResourcePath, 'index.js'), requestMap)) {
    return true;
  }

  return false;
};
