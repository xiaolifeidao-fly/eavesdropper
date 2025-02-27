const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'electron-main',
  entry: {
    main: './src/main.ts',           
    preload: './src/preload.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      "@src": path.resolve(__dirname, './src'),
      "@model": path.resolve(__dirname, '../common/model'),
      "@api": path.resolve(__dirname, '../common/api'),
      "@utils": path.resolve(__dirname, '../common/utils'),
      "@eleapi": path.resolve(__dirname, '../common/eleapi'),
      "@enums": path.resolve(__dirname, '../common/enums')
    }
  },
  externals: [nodeExternals({
    // 排除 electron-store 不被打包
    allowlist: [/^electron-store$/],
  })],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  node: {
    __dirname: false,
    // __filename: false
  }
};