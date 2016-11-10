import test from 'ava';
import isRequestResolvable from '../../src/utilities/isRequestResolvable';

test('true if request includes inline loader', (t) => {
  t.true(isRequestResolvable('/', {}, 'css!./style.css', '/'));
});

test('false if absolute path', (t) => {
  t.true(isRequestResolvable('/', {}, '/', '/') === false);
});

test('false if request path is not under the context path', (t) => {
  t.true(isRequestResolvable('/foo', {}, './index.js', '/bar') === false);
});

test('true if request path can be resolved to a resource', (t) => {
  t.true(isRequestResolvable('/', {'./foo/index.js': 0}, './foo/index.js', '/'));
});

test('true if request path can be resolved to a resource (index)', (t) => {
  t.true(isRequestResolvable('/', {'./foo/index.js': 0}, './foo', '/'));
});

test('true if request path can be resolved to a resource (without extension)', (t) => {
  t.true(isRequestResolvable('/', {'./foo/index.js': 0}, './foo/index', '/'));
});

test('true if request path can be resolved to a resource (directory path)', (t) => {
  t.true(isRequestResolvable('/', {'./index.js': 0}, './', '/'));
});

test('false if request path cannot be resolved to a resource', (t) => {
  t.true(isRequestResolvable('/', {'./foo/index.js': 0}, './bar/index.js', '/') === false);
});
