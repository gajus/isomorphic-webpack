// @flow

import vm from 'vm';
import jsdom from 'jsdom';

/**
 * Runs code and returns the value of the last expression evaluated.
 */
export default (code: string, userOptions: Object = {}): any => {
  const window = jsdom.jsdom('<html><body></body></html>').defaultView;

  const sandbox = {
    console,
    document: window.document,
    ISOMORPHIC_WEBPACK: true,
    require,
    window
  };

  const options = {
    displayErrors: true,
    timeout: 5000,
    ...userOptions
  };

  return vm.runInNewContext(code, sandbox, options);
};
