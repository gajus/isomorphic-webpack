// @flow

import Ajv from 'ajv';
import addAjvKeywords from 'ajv-keywords';
import isomorphicWebpackConfigurationSchema from '../schemas/isomorphicWebpackConfigurationSchema.json';
import type {
  UserIsomorphicWebpackConfigurationType,
  IsomorphicWebpackConfigurationType
} from '../types';

const ajv = Ajv();

addAjvKeywords(ajv);

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
    nodeExternalsWhitelist: userIsomorphicWebpackConfig.hasOwnProperty('nodeExternalsWhitelist') ? userIsomorphicWebpackConfig.nodeExternalsWhitelist : [],
    useCompilationPromise: userIsomorphicWebpackConfig.hasOwnProperty('useCompilationPromise') ? Boolean(userIsomorphicWebpackConfig.useCompilationPromise) : false
  };

  return isomorphicWebpackConfiguration;
};
