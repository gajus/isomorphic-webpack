// @flow

/**
 * @see https://webpack.github.io/docs/configuration.html#entry
 */
export type WebpackEntryConfigurationType = string | Array<string> | {[key: string]: string | Array<string>};

export type UserIsomorphicWebpackConfigurationType = {
  +nodeExternalsWhitelist?: Array<string | RegExp>,
  +useCompilationPromise?: boolean
};

export type IsomorphicWebpackConfigurationType = {|
  +nodeExternalsWhitelist: Array<string | RegExp>,
  +useCompilationPromise: boolean
|};
