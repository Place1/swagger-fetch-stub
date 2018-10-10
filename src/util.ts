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

export function indexOfMin(list: number[]) {
  if (list.length === 0) {
    return -1;
  }

  var min = list[0];
  var minIndex = -1;

  for (var i = 1; i < list.length; i++) {
    if (list[i] < min) {
      minIndex = i;
      min = list[i];
    }
  }

  return minIndex;
}
