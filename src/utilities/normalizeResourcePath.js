export const normalizePath = (request: string): string => {
  return request.replace(/\\/g, '/');
};
