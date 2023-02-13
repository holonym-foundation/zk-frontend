const path = require('path');
const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require("@craco/craco");
const { ProvidePlugin }= require("webpack")
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    reactScriptsVersion: "react-scripts" /* (default value) */,
    babel: {
        presets: [],
        plugins: [],
        // loaderOptions: { /* Any babel-loader configuration options: https://github.com/babel/babel-loader. */ },
        // loaderOptions: (babelLoaderOptions, { env, paths }) => { return babelLoaderOptions; }
    },
    webpack: {
        // configure: { /* Any webpack configuration options: https://webpack.js.org/configuration */ },
        configure: (webpackConfig, { env, paths }) => {
          webpackConfig.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto"
          });

          const wasmExtensionRegExp = /\.wasm$/;

          webpackConfig.resolve.extensions.push('.wasm');

          webpackConfig.module.rules.forEach(rule => {
            (rule.oneOf || []).forEach(oneOf => {
              if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
                // make file-loader ignore WASM files
                oneOf.exclude.push(wasmExtensionRegExp);
              }
            });
          });

          // add a dedicated loader for WASM
          webpackConfig.module.rules.push({
            test: wasmExtensionRegExp,
            include: path.resolve(__dirname, 'src'),
            use: [{ loader: require.resolve('wasm-loader'), options: {} }]
          });

          // // Add web assembly support
          // if (webpackConfig.module.experiments) {
          //   webpackConfig.module.experiments.push({
          //     asyncWebAssembly: true,
          //   });
          // } else {
          //   webpackConfig.module.experiments= {
          //     asyncWebAssembly: true,
          //   };
          // }

          // Banana wallet config
          webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
            if (rule.oneOf instanceof Array) {
              rule.oneOf[rule.oneOf.length - 1].exclude = [/\.(js|mjs|jsx|cjs|ts|tsx)$/, /\.html$/, /\.json$/];
            }
            return rule;
          });
          webpackConfig.resolve.fallback = {
            ...webpackConfig.resolve.fallback,
            // polyfills for banana wallet
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer"),
            crypto: require.resolve("crypto-browserify"),
            process: require.resolve("process"),
            os: require.resolve("os-browserify"),
            path: require.resolve("path-browserify"),
            constants: require.resolve("constants-browserify"), 
            fs: false,
            // polyfills for the rest of the app
            assert: require.resolve("assert"),
          }
          webpackConfig.resolve.extensions = [...webpackConfig.resolve.extensions, ".ts", ".js"]
          webpackConfig.plugins = [
            ...webpackConfig.plugins,
            new ProvidePlugin({
              Buffer: ["buffer", "Buffer"],
            }),
            new ProvidePlugin({
                process: ["process"]
            }),
            new NodePolyfillPlugin(),
          ]

          return webpackConfig; 
        }
    },
    plugins: [
        {
            plugin: {
                overrideCracoConfig: ({ cracoConfig, pluginOptions, context: { env, paths } }) => { return cracoConfig; },
                overrideWebpackConfig: ({ webpackConfig, cracoConfig, pluginOptions, context: { env, paths } }) => { return webpackConfig; },
            },
            options: {}
        }
    ]
};