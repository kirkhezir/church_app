/**
 * Custom Jest transformer that wraps @swc/jest to handle import.meta.env
 * before SWC processes the file (SWC cannot transform import.meta in CJS mode).
 */
const { createTransformer } = require('@swc/jest');

const swcTransformer = createTransformer({
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: true,
    },
    transform: {
      react: {
        runtime: 'automatic',
      },
    },
  },
  module: {
    type: 'commonjs',
  },
});

module.exports = {
  ...swcTransformer,
  process(src, filename, config) {
    // Replace import.meta.env.X with process.env.X before SWC parses the file
    const transformed = src.replace(/import\.meta\.env/g, 'process.env');
    return swcTransformer.process(transformed, filename, config);
  },
};
