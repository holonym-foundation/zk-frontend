import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from "vite-plugin-top-level-await";
import * as dotenv from 'dotenv'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3002,
  },
  plugins: [
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
        exclude: [
          'crypto',
          // 'fs', // Excludes the polyfill for `fs` and `node:fs`.
        ],
      // // Whether to polyfill specific globals.
      // globals: {
      //   Buffer: true, // can also be 'build', 'dev', or false
      //   global: true,
      //   process: true,
      // },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
    wasm(),
    topLevelAwait(),
    react(),
  ],
  worker: {
    format: 'es',
    plugins: [
      nodePolyfills({
        // To exclude specific polyfills, add them to this list.
        exclude: [
          'crypto',
          // 'fs', // Excludes the polyfill for `fs` and `node:fs`.
        ],
        // // Whether to polyfill specific globals.
        // globals: {
        //   Buffer: true, // can also be 'build', 'dev', or false
        //   global: true,
        //   process: true,
        // },
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
      NodeGlobalsPolyfillPlugin({
        buffer: true,
        process: true,
      }),
      wasm(),
      topLevelAwait()
    ]
  },
  define: {
    'process.env': process.env,
    'process.browser': true,
  }
})
