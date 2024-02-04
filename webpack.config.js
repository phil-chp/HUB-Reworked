const path = require('path');

module.exports = {
  mode: 'development', // TODO: 'production'
  entry: {
    background: './src/background/index.ts',
    content_script: './src/content_script/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared/'),
    },
  },
  devtool: 'inline-source-map',
  watch: true
};
