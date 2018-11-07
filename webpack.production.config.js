const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

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

  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.s[ac]ss$/, use: ExtractTextPlugin.extract('css-loader!sass-loader'),
      },
      {
        test: /\.(png|svg|woff2|ttf)$/,
        use: 'file-loader',
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),

    new CopyWebpackPlugin([{
      context: './static/',
      from: '**/*',
      to: './',
    }, {
      context: './assets/',
      from: '**/*',
      to: './assets',
    }]),

    new webpack.DefinePlugin({
      __DEV__: false,
      __CHROME__: JSON.stringify(JSON.parse(process.env.BUILD_CHROME || true)),
      __FIREFOX__: JSON.stringify(JSON.parse(process.env.BUILD_FF || false)),
    }),
  ],

  resolve: {
    extensions: ['.js', '.sass', '.scss'],
  },
};
