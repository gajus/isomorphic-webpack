import test from 'ava';
import getEntryScriptPath from '../../src/utilities/getEntryScriptPath';

test('string entry resoves to the value of string', (t) => {
  t.true(getEntryScriptPath('./app.js') === './app.js');
});

test('array entry resolves to the last value in the array', (t) => {
  t.true(getEntryScriptPath(['./foo.js', './bar.js']) === './bar.js');
});

test('single property object with a string value resolves to the value of the string', (t) => {
  t.true(getEntryScriptPath({foo: './app.js'}) === './app.js');
});

test('single property object with an array value resolves to the last value of the array', (t) => {
  t.true(getEntryScriptPath({foo: ['./foo.js', './bar.js']}) === './bar.js');
});

test('multiple property object throws', (t) => {
  t.throws(() => {
    getEntryScriptPath({
      bar: './bar.js',
      foo: './foo.js'
    });
  }, 'Unsupported "entry" configuration.');
});
