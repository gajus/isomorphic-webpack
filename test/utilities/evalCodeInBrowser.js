import test from 'ava';
import evalCodeInBrowser from '../../src/utilities/evalCodeInBrowser';

test('runs code and returns the value of the last expression evaluated', (t) => {
  t.deepEqual(evalCodeInBrowser('true;({foo: "FOO"})'), {foo: 'FOO'});
});
