import { swaggerPathToUrlPattern } from "./util";

const yaml = require('js-yaml');
const jsonrefs = require('json-ref-lite');
const swagmock = require('swagmock');
const UrlPattern = require('url-pattern');
const nodeFetch = require('node-fetch');

namespace SwaggerFetchStub {
  export function fromSpec(swaggerSpec: string) {
    const swaggerYaml = yaml.safeLoad(swaggerSpec);
    const spec = jsonrefs.resolve(swaggerYaml);

    const urlPatterns = Object.keys(spec.paths).map(swaggerPathToUrlPattern);
    const mockResponses: Promise<any> = swagmock(spec, { validated: true }).responses();

    return async function fetch(url: string, init: any) {
      url = url.split('?')[0].split('#')[0]; // strip the query and hash from the URL
      const pathIndex = urlPatterns.findIndex((pattern: any) => pattern.match(url) !== null);
      if (pathIndex === -1) {
        console.error(url, init, urlPatterns);
        throw new Error(`swagger-fetch-stub: unknown path ${url}`);
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
