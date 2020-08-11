'use strict';
const webpack = require('webpack');
const path = require('path');
const root = path.join(__dirname, '../');

const nodeExternals = require('webpack-node-externals')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const cssLoaderConfig = require('./css-loader-config');
const postcssLoaderConfig = require('./postcss-loader-config');
const sassLoaderConfig = require('./sass-loader-config');

module.exports = [
  {
    devtool: 'source-map',
    context: path.resolve(__dirname, '../'),
    entry: {
      app: path.join(root, 'src/server/app.js'),
      create_admin_user: path.join(root, 'src/server/create_admin_user.js'),
    },
    output: {
      path: path.join(root, 'server'),
      filename: '[name].js',
      publicPath: '/',
    },
    target: 'node',
    node: {
      // Need this when working with express, otherwise the build fails
      __dirname: false,   // if you don't put this is, __dirname
      __filename: false,  // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    module: {
      rules: [
        {
          // Transpiles ES6-8 into ES5
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          // Loads the javacript into html template provided.
          // Entry point is set below in HtmlWebPackPlugin in Plugins
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              //options: { minimize: true }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.join(root, 'src/server'),
      }
    },
    plugins: [
      //new HtmlWebPackPlugin({
      //  template: './src/server/views/index.html',
      //  filename: './views/index.html',
      //  excludeChunks: [ 'app' ]
      //})
    ]
  },
  {
    devtool: 'source-map',
    context: path.resolve(__dirname, '../'),
    entry: {
      index: path.join(root, 'src/client/js/index.js'),
      include: path.join(root, 'src/client/js/include.js'),
      chat_frame: path.join(root, 'src/client/js/chat_frame.js'),
    },
    output: {
      path: path.join(root, 'public/assets/js'),
      filename: '[name].js',
      publicPath: '/assets/js',
    },
    optimization: {
      //splitChunks: {
      //  name: 'vendor',
      //  chunks: 'initial'
      //},
      minimizer: [
        new TerserPlugin()
      ],
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: {
                loaders: {
                  scss: [
                    'vue-style-loader',
                    cssLoaderConfig,
                    postcssLoaderConfig,
                    sassLoaderConfig,
                  ],
                }
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            },
          ]
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            'style-loader',
            cssLoaderConfig,
            postcssLoaderConfig,
            sassLoaderConfig,
          ],
        },
      ]
    },
    resolve: {
      modules: [
        path.join(root, 'src/client'),
        'node_modules'
      ],
      extensions: ['*', '.js', '.vue', '.json'],
      alias: {
        '@': path.join(root, 'src/client/js'),
        'vue$': 'vue/dist/vue.esm.js',
        'vue-router$': 'vue-router/dist/vue-router.esm.js',
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    //for webpack-dev-server
    devServer: {
      open: true,// Open at brower automatically
      //openPage: 'index.html',// Open this page automatically
      contentBase: path.join(root, 'public'),// RootDir for build files
      watchContentBase: true, // Watch changed forfiles under  contentBase dir
      host: 'localhost',
      port: 8080,
    },
  },
  {
    devtool: 'source-map',
    entry: {
      style: path.join(root, 'src/client/scss/style.scss'),
      include: path.join(root, 'src/client/scss/include.scss'),
    },
    output: {
      path: path.join(root, 'public/assets/css'),
      filename: '[name].css',
      publicPath: '/assets/css',
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            cssLoaderConfig,
            postcssLoaderConfig,
            sassLoaderConfig,
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].min.css'
      })
    ]
  },
];
