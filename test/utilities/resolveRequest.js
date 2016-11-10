import test from 'ava';
import resolveRequest from '../../src/utilities/resolveRequest';

test('if request cannot be matched: throws error', (t) => {
  t.throws(() => {
    resolveRequest('/', {}, '/foo', '/');
  }, 'Cannot resolve the request.');
});

test('resolves request', (t) => {
  t.true(resolveRequest('/', {'./foo/index.js': 0}, './foo/index.js', '/') === './foo/index.js');
});

test('resolves request (index)', (t) => {
  t.true(resolveRequest('/', {'./foo/index.js': 0}, './foo', '/') === './foo/index.js');
});

test('resolves request (without extension)', (t) => {
  t.true(resolveRequest('/', {'./foo/index.js': 0}, './foo/index', '/') === './foo/index.js');
});

test('resolves request (directory path)', (t) => {
  t.true(resolveRequest('/', {'./index.js': 0}, './', '/') === './index.js');
});

test('resolves request (inline loader)', (t) => {
  t.true(resolveRequest(__dirname, {'../../node_modules/css-loader/index.js!./../style.css': 0}, 'css!./style.css', __dirname) === '../../node_modules/css-loader/index.js!./../style.css');
});

test('resolves request (multiple inline loaders)', (t) => {
  t.true(resolveRequest(__dirname, {'../../node_modules/css-loader/index.js!../../node_modules/css-loader/index.js!./../style.css': 0}, 'css!css!./style.css', __dirname) === '../../node_modules/css-loader/index.js!../../node_modules/css-loader/index.js!./../style.css');
});
