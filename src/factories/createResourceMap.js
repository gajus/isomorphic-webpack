// @flow

/**
 * Creates an object that maps request to module ID.
 *
 * A 'request' is a require path used in the application
 * resolved to a relative path to the project context, e.g.
 * if `./src/test/index.js` requires `require('./style.css')`
 * the the 'request' is `./src/test.style.css`.
 */
export default (manifest: Object): Object => {
  const map = {};
  const paths = Object.keys(manifest.content);

  for (const path of paths) {
    map[path] = manifest.content[path].id;
  }

  return map;
};
