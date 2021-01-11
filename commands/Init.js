const inquirer = require('inquirer')
const ora = require('ora')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const git = require('git-promise')
const templateList = require('../config/template.json')
const packageListOrigin = require('../config/packageList.json')
const { exit } = require('process')
const InquirerConfig = require('../config/inquirerConfig')
const {
  parseCmdParams,
  log,
  getGitUser,
  runInstallCmd,
  runCmd,
  genTargetPath
} = require('../utils')
const plugins = require('../plugin')

class Creator {
  constructor(name = undefined, destination, ops = {}) {
    name && (this.name = name)
    this.packageList = []
    this.cmdParams = parseCmdParams(destination)
    this.initOra()
    this.init()
  }

  initOra() {
    this.spinner = ora()
    this.spinner.color = 'blue'
  }

  async init() {
    this.name || await this.askAndSetName()
    await this.askAndSetTemplate()
    await this.askAndSetPkgManager()
    this.isChooseSimpleTemplate() && await this.askAndSetPackage()
    await this.checkFolderExist()
    await this.download()
    await this.usePlugins()
    await this.updatePkgFile()
    await this.initGit()
    await this.runApp()
  }
  // 询问并设置项目名称
  async askAndSetName() {
    const { name } = await inquirer.prompt(InquirerConfig.name)
    this.name = name
  }
  // 询问并设置选定模板
  async askAndSetTemplate() {
    const { template } = await inquirer.prompt(InquirerConfig.template)
    this.template = templateList.find(i => i.name === template)
  }
  // 询问并设置包选择器
  async askAndSetPkgManager() {
    const { manager } = await inquirer.prompt(InquirerConfig.manager)
    this.pkgManager = manager
  }
  // 非完整模板询问是否安装其他依赖
  async askAndSetPackage() {
    const { isNeedPackage } = await inquirer.prompt(InquirerConfig.isNeedPackage)
    if (isNeedPackage === 'yes') {
      const { packageList } = await inquirer.prompt(InquirerConfig.packageList)
      this.packageList = packageList
    }
  }

  // 选择的是否是简易模板
  isChooseSimpleTemplate() {
    return this.template.simple || false
  }
  // 获取绝对路径
  getAbsPath() {
    return genTargetPath(this.name)
  }
  // 检查文件夹是否存在
  async checkFolderExist() {
    const targetPath = this.getAbsPath()
    // 如果create附加了--force或-f参数，则直接执行覆盖操作
    if (this.cmdParams.force) {
      await fse.removeSync(targetPath)
      return
    }
    try {
      // 否则进行文件夹检查
      const isTarget = await fse.pathExistsSync(targetPath)
      if (!isTarget) return
      const { recover } = await inquirer.prompt(InquirerConfig.folderExist)
      if (recover === 'cover') {
        fse.removeSync(targetPath)
        return
      } else if (recover === 'newFolder') {
        const { newName } = await inquirer.prompt(InquirerConfig.rename)
        this.name = newName
        await this.checkFolderExist()
        return
      } else {
        exit(1)
      }
    } catch (error) {
      log.error(`${error}`)
      exit(1)
    }
  }
  async download(branch = '') {
    const localPath = this.name
    const _branch = branch ? `-b ${branch} --` : '--'
    const _repoPath = `clone ${_branch} ${this.template.url} ./${localPath}`
    this.spinner.start('正在下载模板,请稍等...')
    try {
      await git(_repoPath)
      this.spinner.succeed('模板下载成功！')
      // 删除git文件追踪
      this.deleteGit(localPath)
    } catch (error) {
      this.spinner.stop()
    }
  }

  // 更新package.json中的信息
  async updatePkgFile() {
    const pkgPath = path.resolve(this.getAbsPath(), 'package.json')
    if (!fs.existsSync(pkgPath)) throw Error('找不到 package.json 文件')
    this.spinner.start('正在更新package.json...')
    const unnecessaryKey = ['keywords', 'license', 'files']
    const { name = '', email = '' } = await getGitUser()
    const jsonData = fse.readJsonSync(pkgPath)
    unnecessaryKey.forEach(key => delete jsonData[key])

    // 选择简易模板且选择额外拓展包
    if (this.isChooseSimpleTemplate() && this.packageList.length > 0) {
      // todo--后续考虑模板vue版本问题，判断引入的依赖版本
      for (const item of this.packageList) {
        jsonData['dependencies'][item] = packageListOrigin[item]
      }
    }
    // 更新后的基本信息与源信息聚合
    Object.assign(jsonData, {
      name: this.name,
      author: name && email ? `${name} ${email}` : '',
      provide: true,
      version: '1.0.0'
    })

    await fse.writeJsonSync(pkgPath, jsonData, {
      spaces: '\t'
    })
    this.spinner.succeed('package.json更新完成！')
  }
  // 初始化git
  async initGit() {
    this.spinner.start('正在初始化Git管理项目...')
    const absPath = this.getAbsPath()
    await runCmd(`cd ${absPath}`)
    // 将node当前的工作目录改成项目目录
    process.chdir(absPath)
    await runCmd(`git init`)
    this.spinner.succeed('Git初始化完成！')
  }
  // 删除原有模板项目.git追踪
  async deleteGit(localPath) {
    try {
      await fs.rmdirSync(`./${localPath}/.git`, { recursive: true })
    } catch (e) {
      log.error(`无法删除对原有git文件的追踪:${e}`)
    }
  }
  async runApp() {
    // this.spinner.start('正在安装依赖...\n')
    console.log('正在安装依赖...')
    // 有个小问题..子进程结束后导致child.stdout.on事件无法获取..只能手动捕获
    try {
      await runInstallCmd(this.pkgManager, 'install')
    // eslint-disable-next-line no-empty
    } catch (error) {

    }
    await this.createFirstCommit()
    this.spinner.succeed('项目初始化完成,请输入:')
    log.success(`cd ${this.name} && ${this.pkgManager} run dev`)
  }
  async createFirstCommit() {
    await runCmd(`git add .`)
    await runCmd(`git commit -m "feat: first commit"`)
  }
  // 简单模板下plugins配置--文件增强
  async usePlugins() {
    if (this.isChooseSimpleTemplate() && this.packageList.length > 0) {
      for (const item of this.packageList) {
        plugins[item](this.name)
      }
    }
  }
}
module.exports = Creator
