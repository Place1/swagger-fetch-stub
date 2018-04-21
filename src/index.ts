import { swaggerPathToUrlPattern } from "./util";

const fs = require('fs');
const yaml = require('js-yaml');
const jsonrefs = require('json-refs');
const swagmock = require('swagmock');
const UrlPattern = require('url-pattern');
const nodeFetch = require('node-fetch');

async function readFileAsync(path: string) {
  return new Promise((resolve, reject) => fs.readFile(path, (err: Error, content: string) => err ? reject(err) : resolve(content)));
}

export async function swaggerApiMock(specPath: string) {
  const file = await readFileAsync(specPath);
  const swaggerYaml = yaml.safeLoad(file);
  const { resolved } = await jsonrefs.resolveRefs(swaggerYaml);
  const spec = resolved;

  const urlPatterns = Object.keys(spec.paths).map(swaggerPathToUrlPattern);
  const mockResponses = await swagmock(spec, { validated: true }).responses();

  return async function fetch(url: string, init: any) {
    const pathIndex = urlPatterns.findIndex((pattern: any) => pattern.match(url) !== null);
    if (pathIndex === -1) {
      console.error(url, init, urlPatterns);
      throw new Error('swagger-fetch-stub: unknown path');
    }
    const mockedPath = mockResponses[Object.keys(spec.paths)[pathIndex]];
    const mockedMethod = mockedPath[init.method.toLowerCase()];
    const mockedResponseStatus = Object.keys(mockedMethod.responses)[0];
    const mockedResponse = mockedMethod.responses[mockedResponseStatus];
    return Promise.resolve(new nodeFetch.Response(JSON.stringify(mockedResponse), { status: parseInt(mockedResponseStatus) }));
  }
}
