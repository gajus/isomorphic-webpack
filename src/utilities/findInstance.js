// @flow

export default (haystack: Array<Object>, needleConstructor: Function): Object => {
  for (const needle of haystack) {
    if (needle instanceof needleConstructor) {
      return needle;
    }
  }
  throw new Error('Instance not found.');
};
