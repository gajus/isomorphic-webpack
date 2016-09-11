import test from 'ava';
import findInstance from './../../src/utilities/findInstance';

test('finds the first instance of an object in a list constructed with a supplied function', (assert) => {
  const MyConstructor = function () {};
  const myInstance = new MyConstructor();
  const result = findInstance([myInstance], MyConstructor);

  assert.is(result, myInstance);
});

test('fails if object instance constructor cannot be found', (assert) => {
  assert.throws(() => {
    findInstance([], () => {});
  }, 'Instance not found.');
});
