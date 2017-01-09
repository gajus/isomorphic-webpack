// @flow

import vm from 'vm';
import jsdom from 'jsdom';

type RunInNewContextType = {
  columnOffset?: number,
  displayErrors?: boolean,
  lename?: string,
  lineOffset?: number,
  timeout?: number
};

/**
 * Runs code and returns the value of the last expression evaluated.
 */
export default (code: string, userOptions: RunInNewContextType = {}): any => {
  const window = jsdom.jsdom('<html><body></body></html>').defaultView;

  const sandbox = {
    console,
    document: window.document,
    ISOMORPHIC_WEBPACK: true,
    process: {
      env: {
        // eslint-disable-next-line no-process-env
        NODE_ENV: process.env.NODE_ENV
      }
    },
    require,
    window
  };

  const options = {
    displayErrors: true,
    filename: 'isomorphic-webpack',
    timeout: 5000,
    ...userOptions
  };

  return vm.runInNewContext(code, sandbox, options);
};
