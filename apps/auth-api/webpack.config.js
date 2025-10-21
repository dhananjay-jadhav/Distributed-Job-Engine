const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/auth-api'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets', './src/schema.gql'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: join(__dirname, '../../libs/proto/src/proto/auth.proto'), // Path to your proto files
          to: 'protos', // Destination folder relative to the output path
        },
      ],
    }),
  ],
};
