import test from 'ava';
import createIsomorphicWebpackConfiguration from '../../src/factories/createIsomorphicWebpackConfiguration';

test('creates configuration with default values', (t) => {
  const defaultConfiguration = createIsomorphicWebpackConfiguration();

  t.deepEqual(defaultConfiguration, {
    // eslint-disable-next-line no-undefined
    isRequireOverride: undefined,
    useCompilationPromise: false
  });
});

test('user input overwrites default values', (t) => {
  const configuration = createIsomorphicWebpackConfiguration({
    useCompilationPromise: true
  });

  t.deepEqual(configuration, {
    // eslint-disable-next-line no-undefined
    isRequireOverride: undefined,
    useCompilationPromise: true
  });
});

test('presence of an unknown property throws an error', (t) => {
  t.throws(() => {
    createIsomorphicWebpackConfiguration({
      foo: 'bar'
    });
  }, 'Invalid configuration.');
});
