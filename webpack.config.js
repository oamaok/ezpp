const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    popup: [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, 'popup/index.ts'),
      path.resolve(__dirname, 'popup/styles/main.sass'),
    ],
    background: path.resolve(__dirname, 'background/background.ts'),
    content: path.resolve(__dirname, 'background/content.ts'),
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
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules|bower_components)/,
        use: 'ts-loader',
      },
      {
        test: /\.s[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
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
      patterns: [
        {
          context: './static/',
          from: '**/*',
          to: './',
        },
        {
          context: './assets/',
          from: '**/*',
          to: './assets',
        },
      ],
    }),

    new webpack.DefinePlugin({
      __DEV__: !isProduction,
      __CHROME__: JSON.stringify(JSON.parse(process.env.BUILD_CHROME || true)),
      __FIREFOX__: JSON.stringify(JSON.parse(process.env.BUILD_FF || false)),
    }),
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.sass', '.scss'],
  },
}
