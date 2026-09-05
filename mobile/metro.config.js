const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
     transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer")
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    // Modern deps (superjson v2 chain) ship exports-only layouts.
    unstable_enablePackageExports: true,
    // @tanstack/react-query imports react-dom for batching; RN has no DOM
    // and React 18 auto-batches, so resolve it to a pass-through stub.
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === "react-dom") {
        return {
          filePath: path.resolve(__dirname, "stubs/react-dom.js"),
          type: "sourceFile",
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  }
};


module.exports = mergeConfig(getDefaultConfig(__dirname), config);
