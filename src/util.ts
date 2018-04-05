const UrlPattern = require('url-pattern');

export function swaggerPathToUrlPattern(path: string) {
  const urlPath = path.replace('{', ':').replace('}', '');
  return new UrlPattern(urlPath);
}
