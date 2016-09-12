import test from 'ava';
import resolveRequest from './../../src/utilities/resolveRequest';

test('if request cannot be matched: throws error', (assert) => {
  assert.throws(() => {
    resolveRequest('/', {}, '/foo', '/');
  }, 'Cannot resolve the request.');
});

test('resolves request', (assert) => {
  assert.is(resolveRequest('/', {'./foo/index.js': 0}, './foo/index.js', '/'), './foo/index.js');
});

test('resolves request (index)', (assert) => {
  assert.is(resolveRequest('/', {'./foo/index.js': 0}, './foo', '/'), './foo/index.js');
});

test('resolves request (without extension)', (assert) => {
  assert.is(resolveRequest('/', {'./foo/index.js': 0}, './foo/index', '/'), './foo/index.js');
});

test('resolves request (directory path)', (assert) => {
  assert.is(resolveRequest('/', {'./index.js': 0}, './', '/'), './index.js');
});
test('resolves request (inline loader)', (assert) => {
  assert.is(resolveRequest(__dirname, {'../../node_modules/css-loader/index.js!./../style.css': 0}, 'css!./style.css', __dirname), '../../node_modules/css-loader/index.js!./../style.css');
});

test('resolves request (multiple inline loaders)', (assert) => {
  assert.is(resolveRequest(__dirname, {'../../node_modules/css-loader/index.js!../../node_modules/css-loader/index.js!./../style.css': 0}, 'css!css!./style.css', __dirname), '../../node_modules/css-loader/index.js!../../node_modules/css-loader/index.js!./../style.css');
});
