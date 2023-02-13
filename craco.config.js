const path = require('path');
const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require("@craco/craco");
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
          // Bundle web worker
          console.log('process.env.BUILD_WEB_WORKER', process.env.BUILD_WEB_WORKER)
          if (process.env.BUILD_WEB_WORKER === "true") {
            webpackConfig.module = { rules: [] };
            webpackConfig.entry = {
              worker: path.resolve(paths.appPath, "src/web-workers/load-proofs.js"),
            };
            webpackConfig.output = {
              filename: "[name]-bundle.js",
              path: path.resolve(paths.appBuild, "dist/worker"),
            };
            // webpackConfig.module.rules.push({
            //   test: /\.worker\.js$/,
            //   use: {
            //     loader: "worker-loader",
            //   },
            // });

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
            
            webpackConfig.module.rules.push({
              test: /\.(js)$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: "babel-loader",
                  options: {
                    presets: ["@babel/preset-env"],
                    plugins: ["@babel/plugin-transform-modules-commonjs"],
                  },
                },
              ],
            });
            
            return webpackConfig;
          }
          // Bundle main app
          else {
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

            return webpackConfig;
          }
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