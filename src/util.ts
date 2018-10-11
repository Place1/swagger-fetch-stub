import UrlPattern from 'url-pattern';

export class PathMatcher {

  private pattern: UrlPattern;

  constructor(public path: string) {
    const urlPath = path.replace(/\s*{.*?}\s*/g, (match) => {
      return ':' + match
        .replace('{', '')
        .replace('}', '')
        .replace('-', '')
        .replace('_', '');
    });
    this.pattern = new UrlPattern(urlPath);
  }

  /**
   * Calculate a score for how well the  given URL matches
   * the path pattern. `undefined` means there was no match.
   * A higher score number means more path parameters matched.
   * 0 means an exact match, 1 means at least 1 path param was matched, etc.
   */
  score(path: string): number | undefined {
    const match = this.pattern.match(path);
    if (match) {
      return Object.keys(match).length;
    }
    return undefined;
  }
}

/**
 * Given a URL, this will return just the bare URL path.
 */
export function bareUrlPath(url: string) {
  // TODO: scheme, domain, port
  return url.split('?')[0].split('#')[0]; // strip the query and hash from the URL
}

export function findIndexOfMin(list: number[]) {
  if (list.length === 0) {
    return -1;
  }

  var min = list[0];
  var minIndex = 0;

  for (var i = 1; i < list.length; i++) {
    if (list[i] < min) {
      minIndex = i;
      min = list[i];
    }
  }

  return minIndex;
}

/**
 * Given a list of matchers and a path,
 * return the matcher that has the best score, were a lower score is better.
 * A lower score is best because a score of 0 is an exact match.
 */
export function bestMatch(matchers: PathMatcher[], path: string): PathMatcher | undefined {
  const scores = matchers
    .map((matcher) => ({
      matcher,
      score: matcher.score(path)
    }))
    .filter((scoredMatcher) => scoredMatcher.score !== undefined);
  const smallestScore = findIndexOfMin(scores.map((scoredMatcher) => scoredMatcher.score!));
  if (smallestScore !== -1) {
    return scores[smallestScore].matcher;
  }
  return undefined;
}

export function stripBasePath(path: string, basePath: string) {
  // remove the basepath and then clear any resulting duplicate / characters.
  return path.replace(basePath, '').replace(/\/+/g, '/');
}
