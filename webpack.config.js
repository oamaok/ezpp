const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// Check for production flag
const PROD = process.argv.indexOf('-p') !== -1;
const CHROME = !!process.env.BUILD_CHROME;

const definePlugin = new webpack.DefinePlugin({
  __CHROME__: JSON.stringify(JSON.parse(process.env.BUILD_CHROME || 'true')),
  __FIREFOX__: JSON.stringify(JSON.parse(process.env.BUILD_FF || 'false')),
});


const pluginsCommon = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    },
  }),
  new CopyWebpackPlugin([
    { context: './src/static/', from: '**/*', to: './dist/' },
  ]),
  definePlugin,
];

const pluginsChrome = pluginsCommon.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
  }),
]);

const pluginsFirefox = pluginsCommon;

let plugins = [];

if (PROD) {
  plugins = plugins.concat(CHROME ? pluginsChrome : pluginsFirefox);
} else {
  plugins = plugins.concat([
    new CopyWebpackPlugin([{
      context: './src/static/',
      from: '**/*',
      to: './dist/',
    }]),
    definePlugin,
  ]);
}

module.exports = {
  entry: {
    popup: './src/js/index.js',
    changelog: './src/js/changelog.js',
  },
  output: {
    path: __dirname,
    filename: './dist/[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /^node_modules/,
        query: {
          presets: ['es2015'],
        },
      },
      {
        test: /\.json$/, loader: 'json',
      },
      {
        test: /\.s[ac]ss$/, loaders: ['style', 'css', 'postcss', 'sass'],
      },
      {
        test: /\.(png|svg)$/, loader: 'url-loader',
      },
    ],
  },
  plugins,
  postcss: () => [autoprefixer],
  resolve: {
    extensions: ['', '.js'],
  },
};
