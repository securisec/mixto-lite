# mixto-lite-node

This lite SDK is a dependency free minimal library to use with node/typescript/javascript based mixto integrations. 

## Usage
```js
const mixto = new MixtoLite()
```

If the constructor host url or api key is not passed, then the module will look for Mixto environment variables and fall back to reading the local config file.

## Dev
```
npm ci
npm run build
```
