// @flow

import Ajv from 'ajv';
import isomorphicWebpackConfigurationSchema from '../schemas/isomorphicWebpackConfigurationSchema.json';
import type {
  UserIsomorphicWebpackConfigurationType,
  IsomorphicWebpackConfigurationType
} from '../types';

const ajv = Ajv();
const validate = ajv.compile(isomorphicWebpackConfigurationSchema);

export default (userIsomorphicWebpackConfig: UserIsomorphicWebpackConfigurationType = {}): IsomorphicWebpackConfigurationType => {
  if (!validate(userIsomorphicWebpackConfig)) {
    // eslint-disable-next-line no-console
    console.log('validate.errors', validate.errors);

    throw new Error('Invalid configuration.');
  }

  const isomorphicWebpackConfiguration = {
    // eslint-disable-next-line no-undefined
    isRequireOverride: userIsomorphicWebpackConfig.hasOwnProperty('isRequireOverride') ? userIsomorphicWebpackConfig.isRequireOverride : undefined,
    useCompilationPromise: userIsomorphicWebpackConfig.hasOwnProperty('useCompilationPromise') ? Boolean(userIsomorphicWebpackConfig.useCompilationPromise) : false
  };

  return isomorphicWebpackConfiguration;
};
