const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')

const isBuild = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'static/[name].[hash].js',
    chunkFilename: 'static/[name].[hash].js',
    publicPath: isBuild ? './' : '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{
      // ts文件
      test: /\.ts$/,
      loader: 'ts-loader',
      options: { appendTsSuffixTo: [/\.vue$/] }
    }, {
      // vue文件
      // 避免[VueLoaderPlugin Error] No matching rule for .vue files found.
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      // css文件
      test: /\.css$/,
      use: ['style-loader', 'css-loader'] // 可以是数组的格式，指定需要的loader,这里顺序需要注意一下，执行的时候是先执行  css-loader -> style-laoder
      // 这里也可以传入参数
    }, {
      // scss\sass 文件
      test: /\.s[ac]ss$/i,
      use: [
        // 将 JS 字符串生成为 style 节点
        'style-loader',
        // 将 CSS 转化成 CommonJS 模块
        'css-loader',
        // 将 Sass 编译成 CSS
        'sass-loader'
      ]
    }, {
      // 处理 字体文件的 loader
      test: /\.(ttf|eot|svg|woff|woff2)$/,
      use: 'url-loader'
    }, {
      // 图片资源
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      loader: 'url-loader',
      options: {
        esModule: false, // 这里设置为false
        name: '[name].[ext]',
        limit: 10240
      }
    }, {
      // eslint
      enforce: 'pre',
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }]
  },
  devtool: isBuild ? false : 'inline-source-map',
  devServer: {
    contentBase: './dist',
    compress: false,
    port: 8080,
    stats: 'errors-only',
    host: 'localhost',
    hot: true, // HRM
    historyApiFallback: true // 支持 vue-router history mode
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      env: process.env.NODE_ENV === 'production' ? 'pro' : 'dev'
    }),
    new VueLoaderPlugin() // vue-loader 15 后迁移 https://vue-loader.vuejs.org/migrating.html#a-plugin-is-now-required
  ]
}
