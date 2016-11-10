// @flow

// eslint-disable-next-line flowtype/no-weak-types
type IsOverrideType = (request: Object, parent?: Object) => boolean;

export type UserIsomorphicWebpackConfigType = {
  formatErrorStack?: boolean,
  isOverride?: IsOverrideType
};
