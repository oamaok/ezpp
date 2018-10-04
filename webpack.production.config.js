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
        test: /\.(png|svg|woff2)$/, use: 'url-loader',
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
      __DEV__: false,
      __CHROME__: JSON.stringify(JSON.parse(process.env.BUILD_CHROME || true)),
      __FIREFOX__: JSON.stringify(JSON.parse(process.env.BUILD_FF || false)),
    }),
  ],

  resolve: {
    extensions: ['.js', '.sass', '.scss'],
  },
};
