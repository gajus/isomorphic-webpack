// @flow

export default (request: string, requestMap: Object): boolean => {
  return requestMap.hasOwnProperty(request);
};
