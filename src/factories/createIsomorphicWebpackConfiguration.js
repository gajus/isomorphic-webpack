// @flow

const defaultIsOverride = (resolvedRequest) => {
  return !resolvedRequest.endsWith('.js');
};

export default (userIsomorphicWebpackConfig) => {
  const defaultIsomorphicWebpackConfig = {
    isOverride: defaultIsOverride
  };

  const isomorphicWebpackConfig = userIsomorphicWebpackConfig || defaultIsomorphicWebpackConfig;

  return isomorphicWebpackConfig;
};
