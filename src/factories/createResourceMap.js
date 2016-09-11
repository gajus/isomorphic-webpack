// @flow

/**
 * Creates an object that maps request to module ID.
 */
export default (manifest: Object): Object => {
  const map = {};
  const paths = Object.keys(manifest.content);

  for (const path of paths) {
    map[path] = manifest.content[path].id;
  }

  return map;
};
