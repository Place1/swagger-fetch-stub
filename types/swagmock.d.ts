declare module 'swagmock' {

  // This should be a JSON object that matches the structure of
  // a Swagger 2.0 spec that has had all JSON $refs resolved.
  type RefResolvedSwaggerSpec = object;

  interface SwagmockOptions {
    validated?: boolean;
  }

  // This will be a JSON object that matches the swagger model schema
  // for a given path, method and status code.
  type MockResponse = object;

  interface MockResponses {
    [path: string]: {
      [method: string]: {
        responses: {
          [statusCode: string]: MockResponse;
        };
      };
    };
  }

  class SwagMock {
    responses(): Promise<MockResponses>;
  }

  function swagmock(swaggerSpec: RefResolvedSwaggerSpec, options?: SwagmockOptions): SwagMock;

  export = swagmock;
}
