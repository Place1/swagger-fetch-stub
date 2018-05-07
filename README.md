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

## Usage in browser

To use this in the browser you'll need to add the following to your webpack config.
A dependency of this project uses the `fs` module. It's not actually required if you
use in-file json-refs (the only type of ref that swagger officially supports).

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  node: {
    fs: 'empty'
  }
}
```
