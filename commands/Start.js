const portfinder = require('portfinder')
const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { getWebpcakConfig } = require('../utils')
const decorate = require('../packages/webpack-base-config/decorate')
const webpackBaseConfig = require('../packages/webpack-base-config')
const {
  parseCmdParams,
  networkAddress,
  log
} = require('../utils')

class Creator {
  constructor(destination) {
    this.cmdParams = parseCmdParams(destination)
    this.init()
  }
  async init() {
    log.success('🚀🚀🚀  启动项目')
    const finalConfig = await this.setWebpackConfig()
    this.webpackCompiler(finalConfig)
  }

  /**
   * 获取webpack配置项
   */
  async setWebpackConfig() {
    let configPath
    try {
      configPath = await getWebpcakConfig(this.cmdParams.config)
      // 用户自定义配置文件则读取，否则使用脚手架基础webpack配置
    } catch (err) {
      return log.error(err)
    }

    // todo  webpackBaseConfig尚未完善，目前默认用户使用-c指定webpack文件，或者根路径具有webpack.config.js或sword.config.js
    const rawConfig = configPath ? require(configPath) : webpackBaseConfig
    const finalConfig = decorate(rawConfig)
    return finalConfig
  }

  /**
   * webpack配置解析
   * 默认读取sword.config.js文件
   * 兜底读取webpack.config.js文件
   * @param {*} config
   */
  async webpackCompiler(config) {
    const compiler = Webpack(config)
    let hasCompiled = false
    let finalPort = config.devServer.port || 8080
    portfinder.basePort = finalPort
    finalPort = await portfinder.getPortPromise()
    // Webpack解析完毕后
    compiler.hooks.done.tap('sword-cli', () => {
      // 延迟两个tick进行
      process.nextTick(() => {
        process.nextTick(() => {
          if (hasCompiled) return
          hasCompiled = true

          // 端口被占用自动切换端口
          if (config.devServer.port !== finalPort) {
            console.log(`> 端口:${config.devServer.port}被占用,自动切换成:${finalPort}`)
          }

          const localUrl = `http://${config.devServer.host || 'localhost'}:${finalPort}`
          const localIpv4Address = networkAddress()
          log.logObj({
            本地地址: localUrl,
            内网地址: localIpv4Address && `http://${localIpv4Address}:${finalPort}`,
            编译环境: 'development'
          })
        })
      })
    })

    const devServerOption = Object.assign({}, config.devServer, {
      open: false,
      port: finalPort
    })
    // 服务器启动
    const server = new WebpackDevServer(compiler, devServerOption)

    server.listen(finalPort, config.devServer.host)
  }
}

module.exports = Creator
