import path from 'path';

export const normalizePath = (request: string): string => {
  return request.replace(/\\/g, '/');
};

export const resolvePath = (...pathSegments: any[]): string => {
  return normalizePath(path.resolve(...pathSegments));
};
