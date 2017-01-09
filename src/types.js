// @flow

// eslint-disable-next-line flowtype/no-weak-types
type IsRequireOverrideType = (request: Object, parent?: Object) => boolean;

export type UserIsomorphicWebpackConfigurationType = {
  isRequireOverride?: IsRequireOverrideType,
  nodeExternalsWhitelist?: Array<string | RegExp>,
  useCompilationPromise?: boolean
};

export type IsomorphicWebpackConfigurationType = {|
  +isRequireOverride?: IsRequireOverrideType,
  +nodeExternalsWhitelist: Array<string | RegExp>,
  +useCompilationPromise: boolean
|};
