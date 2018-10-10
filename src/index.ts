import { swaggerPathToUrlPattern, indexOfMin } from "./util";

const yaml = require('js-yaml');
const jsonrefs = require('json-ref-lite');
const swagmock = require('swagmock');
const nodeFetch = require('node-fetch');

export interface Options {
  basePath?: string;
}

export class NotFoundError extends Error {
  constructor(path: string) {
    super();
    this.message = `Unknown path: ${path}`
  }
}

export class SwaggerFetchStub {
  static fromSpec(swaggerSpec: string, options: Options = {}) {
    const swaggerYaml = yaml.safeLoad(swaggerSpec);
    const spec = jsonrefs.resolve(swaggerYaml);

    const urlPatterns = Object.keys(spec.paths)
      .map((path) => {
        const basePath = options.basePath || spec.basePath || '';
        return `/${basePath}/${path}`.replace(/\/+/g, '/');
      })
      .map(swaggerPathToUrlPattern);
    const mockResponses: Promise<any> = swagmock(spec, { validated: true }).responses();

    return async function fetch(url: string, init: any) {
      url = url.split('?')[0].split('#')[0]; // strip the query and hash from the URL

      // we want to find the index of the url pattern that matches the requested
      // url. In the case of multiple matches, we want to pick the match with the
      // least matching path params.
      // This is done so that paths such as
      //   /api/item/:name/:name/
      // that appear before paths such as
      //   /api/item/:name/value/
      // don't stop the latter from being requested.
      const matchingUrlsPaths = urlPatterns
        .map((pattern: any) => {
          const match = pattern.match(url);
          if (match) {
            return Object.keys(match).length;
          }
        })
        .filter((matchRank) => matchRank !== undefined) as number[];
      const pathIndex = indexOfMin(matchingUrlsPaths);

      if (pathIndex === -1) {
        throw new NotFoundError(url);
      }
      const mockedPath = (await mockResponses)[Object.keys(spec.paths)[pathIndex]];
      const mockedMethod = mockedPath[init.method.toLowerCase()];
      const mockedResponseStatus = Object.keys(mockedMethod.responses)[0];
      const mockedResponse = mockedMethod.responses[mockedResponseStatus];
      return Promise.resolve(new nodeFetch.Response(JSON.stringify(mockedResponse), { status: parseInt(mockedResponseStatus) }));
    }
  }
}

export default SwaggerFetchStub;
