const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// Check for production flag
const PROD = process.argv.indexOf('-p') !== -1;

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: __dirname,
    filename: './dist/popup.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /^node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.sass$/, loaders: ['style', 'css', 'postcss', 'sass'],
      },
      {
        test: /\.(png|svg)$/, loader: 'url-loader'
      }
    ]
  },
  // Only enable minification and NODE_ENV modifications
  // when launched with -p
  plugins: PROD ? [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
    new CopyWebpackPlugin([
      { context: './src/static/', from: '**/*', to: './dist/'}
    ])
  ] : [new CopyWebpackPlugin([
      { context: './src/static/', from: '**/*', to: './dist/'}
    ])],
  postcss: () => [autoprefixer],
  resolve: {
    extensions: ['', '.js']
  }
};