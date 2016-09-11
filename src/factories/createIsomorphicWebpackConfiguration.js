// @flow

export default (userIsomorphicWebpackConfig) => {
  const defaultIsomorphicWebpackConfig = {};

  const isomorphicWebpackConfig = userIsomorphicWebpackConfig || defaultIsomorphicWebpackConfig;

  return isomorphicWebpackConfig;
};
