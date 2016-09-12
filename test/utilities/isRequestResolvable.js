import test from 'ava';
import isRequestResolvable from './../../src/utilities/isRequestResolvable';

test('true if request includes inline loader', (assert) => {
  assert.true(isRequestResolvable('/', {}, 'css!./style.css', '/'));
});

test('false if absolute path', (assert) => {
  assert.false(isRequestResolvable('/', {}, '/', '/'));
});

test('false if request path is not under the context path', (assert) => {
  assert.false(isRequestResolvable('/foo', {}, './index.js', '/bar'));
});

test('true if request path can be resolved to a resource', (assert) => {
  assert.true(isRequestResolvable('/', {'./foo/index.js': 0}, './foo/index.js', '/'));
});

test('true if request path can be resolved to a resource (index)', (assert) => {
  assert.true(isRequestResolvable('/', {'./foo/index.js': 0}, './foo', '/'));
});

test('true if request path can be resolved to a resource (without extension)', (assert) => {
  assert.true(isRequestResolvable('/', {'./foo/index.js': 0}, './foo/index', '/'));
});

test('true if request path can be resolved to a resource (directory path)', (assert) => {
  assert.true(isRequestResolvable('/', {'./index.js': 0}, './', '/'));
});

test('false if request path cannot be resolved to a resource', (assert) => {
  assert.false(isRequestResolvable('/', {'./foo/index.js': 0}, './bar/index.js', '/'));
});
