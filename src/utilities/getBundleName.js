// @flow

import type {
  WebpackEntryConfigurationType
} from '../types';

export default (entry: WebpackEntryConfigurationType): string => {
  if (typeof entry === 'string' || Array.isArray(entry)) {
    return 'main';
  } else {
    const bundleNames = Object.keys(entry);

    if (bundleNames.length === 0) {
      throw new Error('Invalid "entry" configuration.');
    } else if (bundleNames.length > 1) {
      // eslint-disable-next-line no-console
      console.log('Multiple bundles are not supported. See https://github.com/gajus/isomorphic-webpack/issues/10.');

      throw new Error('Unsupported "entry" configuration.');
    }

    return bundleNames[0];
  }
};
