// @flow

/**
 * @see https://webpack.github.io/docs/using-loaders.html#loaders-in-require
 */
export default (request: string): boolean => {
  return request.includes('!');
};
