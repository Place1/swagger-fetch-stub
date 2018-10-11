import { PathMatcher, bareUrlPath, bestMatch, stripBasePath } from "./util";
import swagmock from 'swagmock';

const yaml = require('js-yaml');
const jsonrefs = require('json-ref-lite');
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

    // Get all the paths from the spec. Remember that paths are the keys
    const specPaths = Object.keys(spec.paths);

    // Create a list of matcher objects for our spec paths.
    // We'll use these to determine which OpenAPI operation
    // an HTTP request is for, determined by using the request path.
    const pathMatchers = specPaths.map((path) => new PathMatcher(path));

    // Generate our mock responses collection for the given spec.
    const mockResponses = swagmock(spec, { validated: true }).responses();

    // The api base path. We use the provided base path with preference over
    // the base path defined in the spec so that clients can override it.
    const basePath = options.basePath || spec.basePath || '';

    return async function fetch(url: string, init: RequestInit) {
      const path = stripBasePath(bareUrlPath(url), basePath);

      const matcher = bestMatch(pathMatchers, path);
      if (matcher === undefined) {
        throw new NotFoundError(url);
      }

      const method = init.method || 'get';
      const responses = await mockResponses;
      const responsesByCode = responses[matcher.path][method.toLowerCase()].responses;
      const code = Object.keys(responsesByCode)[0];
      const data = responsesByCode[code];
      return Promise.resolve<Response>(new nodeFetch.Response(JSON.stringify(data), { status: parseInt(code) }));
    }
  }
}

export default SwaggerFetchStub;
