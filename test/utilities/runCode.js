import test from 'ava';
import runCode from '../../src/utilities/runCode';

test('runs code and returns the value of the last expression evaluated', (t) => {
  t.deepEqual(runCode('true;({foo: "FOO"})'), {foo: 'FOO'});
});
