import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const polyfillMap = {
  stream: 'stream-browserify',
};

/** @type {import('esbuild').Plugin} */
export default {
  name: 'node-built-in-polyfills',
  setup(build) {
    for (const [builtin, polyfill] of Object.entries(polyfillMap)) {
      const resolved = require.resolve(polyfill);
      build.onResolve({ filter: new RegExp(`^${builtin}$`) }, () => ({
        path: resolved,
      }));
    }
  },
};
