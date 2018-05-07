# swagger-fetch-stub

## How to use

```typescript
import { swaggerApiMock } from 'swagger-fetch-stub';

const spec = join(__dirname, 'path/to/swagger.yaml');
const swaggerFetchMock = swaggerApiMock(spec);

// the swaggerFetchMock implements a Fetch method, just like window.fetch
// you can pass it to a swagger-codegen SDK as the FetchAPI parameter.
// you'll have to use an empty base-path with your SDK for it to work.
```
