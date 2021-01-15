const path = require('path')
const portfinder = require('portfinder')
const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const getWebpcakConfig = require('../utils')
const webpackBaseConfig = require('')
const {
  parseCmdParams,
} = require('../utils')

class Creator {
  constructor(destination) {
    this.cmdParams = parseCmdParams(destination)
    this.init()
  }
  async init() {
    console.log('🚀🚀🚀', chalk.magenta('启动项目'))
    webpackCompiler(finalConfig)
  }

  /**
   * 获取webpack配置项
   */
  async function setWebpackConfig() {
    const configPath = getWebpcakConfig(this.cmdParams.config)
    // 用户自定义配置文件则读取，否则使用脚手架基础webpack配置
    const rawConfig = configPath ? require(configPath) : webpackBaseConfig
  }

  /**
   * webpack配置解析
   * 默认读取sword.config.js文件
   * 兜底读取webpack.config.js文件
   * @param {*} config 
   */
  async function webpackCompiler (config) {

    // 服务器启动
    const server = new WebpackDevServer(compiler, devServerOption)

    server.listen(finalPort, config.devServer.host)
  }
}

module.exports = Creator
