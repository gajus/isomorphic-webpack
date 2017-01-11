import test from 'ava';
import {normalizePath} from '../../src/utilities/normalizeResourcePath';

test('should leave normal path alone', (t) => {
  t.true(normalizePath('./') === './');
});

test('should normalize Windows path to Linux style', (t) => {
  t.true(normalizePath('./..\\images') === './../images');
});

test('should work with absolute path as well', (t) => {
  t.true(normalizePath('C:\\Working') === 'C:/Working');
});
