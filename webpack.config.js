const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    popup: [
      path.resolve(__dirname, 'popup/index.js'),
      path.resolve(__dirname, 'popup/styles/main.sass'),
    ],
    changelog: path.resolve(__dirname, 'changelog/index.js'),
    background: path.resolve(__dirname, 'background/background.js'),
    content: path.resolve(__dirname, 'background/content.js'),
  },

  stats: {
    children: true,
  },

  mode: isProduction ? 'production' : 'development',

  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: 'babel-loader',
      },
      {
        test: /\.s[ac]ss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|woff2?|ttf|eot)$/,
        use: 'file-loader',
      },
    ],
  },

  devtool: false,

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),

    new CopyWebpackPlugin({
      patterns: [{
        context: './static/',
        from: '**/*',
        to: './',
      }, {
        context: './assets/',
        from: '**/*',
        to: './assets',
      }],
    }),

    new webpack.DefinePlugin({
      __DEV__: !isProduction,
      __CHROME__: JSON.stringify(JSON.parse(process.env.BUILD_CHROME || true)),
      __FIREFOX__: JSON.stringify(JSON.parse(process.env.BUILD_FF || false)),
    }),
  ],

  resolve: {
    extensions: ['.js', '.sass', '.scss'],
  },
};
