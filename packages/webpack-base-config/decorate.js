const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const WebpackBar = require('webpackbar')

module.exports = function(config, otherConfig = {}) {
  addProcessBar(config)
  const tmpOption = {}
  handleAnalyzer(tmpOption)

  Object.assign(tmpOption, config)
  return tmpOption

  /**
 * 处理Analyzer
 * @param {Object} config
 */
  function handleAnalyzer(config) {
    if (config.analyzer) {
      config.plugins.push(new BundleAnalyzerPlugin())
    }
  }

  /**
   * 构建进度条
   * @param {Object} config
   */
  function addProcessBar(config) {
    config.plugins.push(new WebpackBar({
      name: 'sword-cli'
    }))
  }
}
