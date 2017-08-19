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
export default (code: string, userOptions: RunInNewContextType = {}, windowUrl?: string, customContext?: {}): any => {
  const window = jsdom.jsdom('<html><body></body></html>').defaultView;

  if (windowUrl) {
    jsdom.changeURL(window, windowUrl);
  }

  const sandbox = Object.assign(
    {},
    {
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
    },
    customContext
  );

  const options = {
    displayErrors: true,
    filename: 'isomorphic-webpack',
    timeout: 5000,
    ...userOptions
  };

  return vm.runInNewContext(code, sandbox, options);
};
