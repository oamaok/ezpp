const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    popup: [
      path.resolve(__dirname, 'src/js/index.js'),
      path.resolve(__dirname, 'src/sass/main.sass'),
    ],
    changelog: path.resolve(__dirname, 'src/js/changelog.js'),
  },

  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/, loader: 'babel-loader',
      },
      {
        test: /\.json$/, loader: 'json-loader',
      },
      {
        test: /\.s[ac]ss$/, loader: ExtractTextPlugin.extract('css-loader!sass-loader'),
      },
      {
        test: /\.(png|svg|woff2)$/, loader: 'url-loader',
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),

    new CopyWebpackPlugin([
      {
        context: './src/static/',
        from: '**/*',
        to: '.',
      },
    ]),

    new webpack.DefinePlugin({
      __CHROME__: JSON.stringify(JSON.parse(process.env.BUILD_CHROME || true)),
      __FIREFOX__: JSON.stringify(JSON.parse(process.env.BUILD_FF || false)),
    }),
  ],

  resolve: {
    extensions: ['.js', '.sass', '.scss'],
  },
};
