/* eslint-disable no-console */
const path = require('path');
const { merge } = require('rspack-merge');
const { TsCheckerRspackPlugin } = require('ts-checker-rspack-plugin');
const { ReactRefreshRspackPlugin } = require('@rspack/plugin-react-refresh');
const { setupWebpackDotenvFilesForEnv, setupDotenvFilesForEnv } = require('./dotenv');

setupDotenvFilesForEnv({ env: 'development' });
const rspackCommon = require('./rspack.common.js');

const RELATIVE_DIRNAME = process.env._RELATIVE_DIRNAME;
const IS_PROJECT_ROOT_DIR = process.env._IS_PROJECT_ROOT_DIR === 'true';
const SRC_DIR = process.env._SRC_DIR;
const COMMON_DIR = process.env._COMMON_DIR;
const PUBLIC_PATH = process.env._PUBLIC_PATH;
const DIST_DIR = process.env._DIST_DIR;
const HOST = process.env._HOST;
const PORT = process.env._PORT;
const PROXY_PROTOCOL = process.env._PROXY_PROTOCOL;
const PROXY_HOST = process.env._PROXY_HOST;
const PROXY_PORT = process.env._PROXY_PORT;
const ROOT_NODE_MODULES = path.resolve(RELATIVE_DIRNAME, '../../../node_modules');
const BASE_PATH = PUBLIC_PATH;

module.exports = merge(
  {
    plugins: [
      ...setupWebpackDotenvFilesForEnv({
        directory: RELATIVE_DIRNAME,
        env: 'development',
        isRoot: IS_PROJECT_ROOT_DIR,
      }),
    ],
  },
  rspackCommon('development'),
  {
    mode: 'development',
    devtool: 'eval-source-map',
    lazyCompilation: false,
    optimization: {
      removeEmptyChunks: true,
    },
    devServer: {
      host: HOST,
      port: PORT,
      compress: true,
      historyApiFallback: true,
      hot: true,
      open: false,
      proxy: [
        {
          context: ['/api', '/healthcheck'],
          target: {
            host: PROXY_HOST,
            protocol: PROXY_PROTOCOL,
            port: PROXY_PORT,
          },
          changeOrigin: true,
        },
      ],
      devMiddleware: {
        stats: 'errors-only',
      },
      client: {
        overlay: false,
      },
      static: {
        directory: DIST_DIR,
        publicPath: BASE_PATH,
      },
      onListening: (devServer) => {
        if (devServer) {
          console.log(
            `\x1b[32m✓ OpenShell available at: \x1b[4mhttp://localhost:${
              devServer.server.address().port
            }\x1b[0m`,
          );
        }
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: [
            SRC_DIR,
            COMMON_DIR,
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly'),
            path.resolve(ROOT_NODE_MODULES, '@patternfly'),
          ],
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [new TsCheckerRspackPlugin(), new ReactRefreshRspackPlugin({ overlay: false })],
  },
);
