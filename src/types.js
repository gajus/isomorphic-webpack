// @flow

export type UserIsomorphicWebpackConfigurationType = {
  +nodeExternalsWhitelist?: Array<string | RegExp>,
  +useCompilationPromise?: boolean
};

export type IsomorphicWebpackConfigurationType = {|
  +nodeExternalsWhitelist: Array<string | RegExp>,
  +useCompilationPromise: boolean
|};
