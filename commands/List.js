const { parseCmdParams } = require('../utils')
const templateList = require('../config/template.json')

class Creator {
  constructor(destination) {
    this.cmdParams = parseCmdParams(destination)
    this.init()
  }

  async init() {
    this.logList()
  }

  /**
   * @todo 列出可选包等列表。
   */
  async logList() {
    // 未填参数项则全部输出
    if (JSON.stringify(this.cmdParams) === '{}') {
      this.logTemplates()
      return
    }

    this.cmdParams.template && this.logTemplates()
  }
  logTemplates() {
    console.table(templateList)
  }
}

module.exports = Creator
