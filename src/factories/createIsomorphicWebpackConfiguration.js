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
    nodeExternalsWhitelist: userIsomorphicWebpackConfig.nodeExternalsWhitelist === undefined ? [] : userIsomorphicWebpackConfig.nodeExternalsWhitelist,

    // eslint-disable-next-line no-undefined
    useCompilationPromise: userIsomorphicWebpackConfig.useCompilationPromise === undefined ? false : Boolean(userIsomorphicWebpackConfig.useCompilationPromise)
  };

  return isomorphicWebpackConfiguration;
};
