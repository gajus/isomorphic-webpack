// @flow

// eslint-disable-next-line flowtype/no-weak-types
type IsRequireOverrideType = (request: Object, parent?: Object) => boolean;

export type UserIsomorphicWebpackConfigurationType = {
  useCompilationPromise?: boolean,
  isRequireOverride?: IsRequireOverrideType
};

export type IsomorphicWebpackConfigurationType = {|
  +useCompilationPromise: boolean,
  +isRequireOverride?: IsRequireOverrideType
|};
