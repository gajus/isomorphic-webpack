import test from 'ava';
import getBundleName from '../../src/utilities/getBundleName';

test('string entry resolves to "main"', (t) => {
  t.true(getBundleName('./app.js') === 'main');
});

test('array entry resolves to "main"', (t) => {
  t.true(getBundleName(['./app.js']) === 'main');
});

test('single property object resolves to the object key', (t) => {
  t.true(getBundleName({foo: './app.js'}) === 'foo');
});

test('multiple property object throws', (t) => {
  t.throws(() => {
    getBundleName({
      bar: './bar.js',
      foo: './foo.js'
    });
  }, 'Unsupported "entry" configuration.');
});
