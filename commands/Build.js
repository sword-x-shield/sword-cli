const webpack = require('webpack')
const rm = require('rimraf')
const { existsSync } = require('fs')
const { getWebpcakConfig } = require('../utils')
const decorate = require('../packages/webpack-base-config/decorate')
const webpackBaseConfig = require('../packages/webpack-base-config')
const path = require('path')
const {
  parseCmdParams,
  log
} = require('../utils')

class Creator {
  constructor(destination) {
    this.cmdParams = parseCmdParams(destination)
    this.init()
  }

  async init() {
    log.success('🚜🚜🚜 正在构建...')
    const finalConfig = await this.setWebpackConfig()
    this.startWeapackBuild(finalConfig)
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
   * 调用webpack构建
   * @param {*} config
   */
  async startWeapackBuild(config) {
    const webpackCb = function(err, stats) {
      if (err) {
        log.error(err)
        process.exit(1)
      }

      process.stdout.write(`${stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      })}\n\n`)
    }

    // 如果配置了path，则按配置path，如果没有则按默认dist文件夹
    const outputDir = config.output.path ? config.output.path : path.resolve(process.cwd(), 'dist')
    const isNotExit = await existsSync(outputDir)

    if (!isNotExit) {
      // 直接打包
      webpack(config, webpackCb)
    } else {
      rm(outputDir, err => {
        if (err) throw err
        webpack(config, webpackCb)
      })
    }
  }
}

module.exports = Creator

