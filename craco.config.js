const path = require('path');
const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require("@craco/craco");
const { ProvidePlugin }= require("webpack")
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
require('dotenv').config();

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
          const wasmExtensionRegExp = /\.wasm$/;
          webpackConfig.resolve.extensions.push('.wasm');
          webpackConfig.experiments = {
            asyncWebAssembly: false,
            lazyCompilation: true,
            syncWebAssembly: true,
            topLevelAwait: true,
          };
          webpackConfig.resolve.fallback = {
            buffer: require.resolve('buffer/')
          }
          webpackConfig.module.rules.forEach((rule) => {
            (rule.oneOf || []).forEach((oneOf) => {
              if (oneOf.type === "asset/resource") {
                oneOf.exclude.push(wasmExtensionRegExp);
              }
            });
          });
          // webpackConfig.plugins.push(new ProvidePlugin({
          //     Buffer: ['buffer', 'Buffer'],
          // }));

          // Banana wallet config
          webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
            if (rule.oneOf instanceof Array) {
              rule.oneOf[rule.oneOf.length - 1].exclude = [/\.(js|mjs|jsx|cjs|ts|tsx)$/, /\.wasm$/, /\.html$/, /\.json$/];
            }
            return rule;
          });
          webpackConfig.resolve.fallback = {
            ...webpackConfig.resolve.fallback,
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer"),
            crypto: require.resolve("crypto-browserify"),
            process: require.resolve("process"),
            os: require.resolve("os-browserify"),
            path: require.resolve("path-browserify"),
            // constants: require.resolve("constants-browserify"),
            constants: false,
            fs: false,
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
            // new NodePolyfillPlugin({
            //   excludeAliases: ["console"]
            // }),
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