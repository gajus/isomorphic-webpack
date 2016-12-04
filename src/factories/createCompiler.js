// @flow

import webpack, {
  Compiler
} from 'webpack';
import MemoryFileSystem from 'memory-fs';

/**
 * Creates a webpack compiler.
 *
 * Configures the compiler to use memory file system.
 */
export default (compilerConfiguration: Object): Compiler => {
  const fs = new MemoryFileSystem();

  const compiler = webpack(compilerConfiguration);

  compiler.outputFileSystem = fs;

  return compiler;
};
