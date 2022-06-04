const webpack = require('webpack');

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const DEV = !process.argv.includes('development');
const useSourceMap = DEV;

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: 'dist',
    port: 4000,
    inline: true,
    watchContentBase: true
  },
  devtool: DEV ? 'inline-source-map' : false,
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js', //コンパイラを組み込む
      'mdc': path.resolve(__dirname, './mdc.js'),
    },
  },
  module: {
    rules: [
      { //Import CSS
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      { //Import SCSS
        test: /\.scss/, // 対象となるファイルの拡張子
        use: ExtractTextPlugin.extract({
          use:
            [
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: useSourceMap,
                importLoaders: 2
              },
            },
            {
              loader: 'sass-loader',
              options: {
                // ソースマップの利用有無
                sourceMap: useSourceMap,
              }
            }
          ]
        }),
      },
      { //Babel
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2015', { modules: false }]
            ]
          }
        }]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
    //new webpack.ProvidePlugin({ 'mdc': 'mdc' }),
  ],
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
  },
};