// @flow

type ManifestContentMapType = {
  [key: string]: {|
    id: number
  |}
};

type ResourceMapType = {
  [key: string]: number
};

/**
 * Creates an object that maps request to module ID.
 *
 * A 'request' is a require path used in the application
 * resolved to a relative path to the project context, e.g.
 * if `./src/test/index.js` requires `require('./style.css')`
 * the the 'request' is `./src/test.style.css`.
 */
export default (manifestContent: ManifestContentMapType): ResourceMapType => {
  const map = {};

  for (const [path, {id}] of Object.entries(manifestContent)) {
    map[path] = id;
  }

  return map;
};
