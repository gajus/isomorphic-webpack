// @flow

import type {
  UserIsomorphicWebpackConfigType
} from '../types';

export default (userIsomorphicWebpackConfig: UserIsomorphicWebpackConfigType = {}): UserIsomorphicWebpackConfigType => {
  const defaultIsomorphicWebpackConfig = {};

  const isomorphicWebpackConfig = userIsomorphicWebpackConfig || defaultIsomorphicWebpackConfig;

  return isomorphicWebpackConfig;
};
