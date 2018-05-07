const UrlPattern = require('url-pattern');

export function swaggerPathToUrlPattern(path: string) {
  const urlPath = path.replace(/\s*{.*?}\s*/g, (match) => {
    return ':' + match
      .replace('{', '')
      .replace('}', '')
      .replace('-', '')
      .replace('_', '');
  });
  return new UrlPattern(urlPath);
}
