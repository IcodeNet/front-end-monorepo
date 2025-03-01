const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

const EnvironmentWebpackPlugin = new webpack.EnvironmentPlugin({
  DEBUG: false,
  NODE_ENV: 'development',
  PANOPTES_ENV: 'staging'
})

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './dev/index.html',
  filename: 'index.html',
  inject: 'body'
})

module.exports = {
  devServer: {
    allowedHosts: [
      'bs-local.com',
      'localhost',
      '.zooniverse.org'
    ],
    host: process.env.HOST || 'localhost',
    https: true
  },
  entry: [
    '@babel/polyfill',
    './dev/index.js'
  ],
  mode: 'development',
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@helpers': path.resolve(__dirname, 'src/helpers'),
      '@plugins': path.resolve(__dirname, 'src/plugins'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@stories': path.resolve(__dirname, 'src/stories'),
      '@test': path.resolve(__dirname, 'test'),
      '@viewers': path.resolve(__dirname, 'src/components/Classifier/components/SubjectViewer')
    }
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: { compact: false }
        }]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  output: {
    path: path.resolve('build'),
    filename: 'main.js',
    library: '@zooniverse/classifier',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    EnvironmentWebpackPlugin,
    HtmlWebpackPluginConfig
  ]
}
