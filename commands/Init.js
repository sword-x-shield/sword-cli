const inquirer = require('inquirer')
const ora = require('ora')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const git = require('git-promise')
const chalk = require('chalk')
const templateList = require('../config/template.json')
const {
  exit
} = require('process')
const inquirerConfig = require('../config/inquirerConfig')
const {
  parseCmdParams,
  log,
  getGitUser,
  runCmd
} = require('../utils')

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
    await this.askAndSetPackage()
    const targetPath = this.getAbsPath()
    await this.checkFolderExist(targetPath)
    await this.download()
    await this.updatePkgFile()
    await this.initGit()
    await this.runApp()
  }
  // 询问并设置项目名称
  async askAndSetName() {
    const {
      name
    } = await inquirer.prompt(inquirerConfig.name)
    this.name = name
  }
  // 询问并设置选定模板
  async askAndSetTemplate() {
    const {
      template
    } = await inquirer.prompt(inquirerConfig.template)
    this.template = template
  }
  // 非完整模板询问是否安装其他依赖
  async askAndSetPackage() {
    const simpleTemplate = ['vue2TS']
    if (simpleTemplate.includes(this.template)) {
      const {
        packageList
      } = await inquirer.prompt(inquirerConfig.packageList)
      this.packageList = packageList
    }
  }
  // 生成目标文件夹的绝对路径
  genTargetPath(relPath) {
    return path.resolve(process.cwd(), relPath)
  }
  // 获取绝对路径
  getAbsPath() {
    return this.genTargetPath(this.name)
  }
  // 检查文件夹是否存在
  checkFolderExist(targetPath) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async(resolve, reject) => {
      // 如果create附加了--force或-f参数，则直接执行覆盖操作
      if (this.cmdParams.force) {
        await fse.removeSync(targetPath)
        return resolve()
      }
      try {
        // 否则进行文件夹检查
        const isTarget = await fse.pathExistsSync(targetPath)
        if (!isTarget) {
          return resolve()
        }
        const {
          recover
        } = await inquirer.prompt(inquirerConfig.folderExist)
        if (recover === 'cover') {
          await fse.removeSync(targetPath)
          return resolve()
        } else if (recover === 'newFolder') {
          const {
            inputNewName
          } = await inquirer.prompt(inquirerConfig.rename)
          this.name = inputNewName
          return resolve()
        } else {
          exit(1)
        }
      } catch (error) {
        log.error(`[sword-cli]Error:${error}`)
        exit(1)
      }
    })
  }
  /**
     * @todo 实现下载
     */
  async download(branch = '') {
    const localPath = this.name
    const _branch = branch ? `-b ${branch} --` : '--'
    const _repoPath = `clone ${_branch} ${templateList[this.template]} ./${localPath}`
    this.spinner.start('正在下载模板,请稍等...')
    try {
      await git(_repoPath)
      this.spinner.succeed('模板下载成功')
      // 删除git文件追踪
      this.deleteGit(localPath)
    } catch (error) {
      this.spinner.stop()
    }
  }
  // 更新package.json中的信息
  async updatePkgFile() {
    this.spinner.start('正在更新package.json...')
    const pkgPath = path.resolve(this.getAbsPath(), 'package.json')
    const unnecessaryKey = ['keywords', 'license', 'files']
    const {
      name = '', email = ''
    } = await getGitUser()

    const jsonData = fse.readJsonSync(pkgPath)
    unnecessaryKey.forEach(key => delete jsonData[key])
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
    await fs.rmdir(`./${localPath}/.git`, { recursive: true }, err => {
      // eslint-disable-next-line no-empty
      if (!err) { } else console.log(`无法删除git文件追踪${err}`)
    })
  }

  /**
     * @todo 安装依赖，执行first commit，提示用户cd目录运行项目
     */
  async runApp() {
    this.spinner.start('正在安装依赖')
    await runCmd(`npm install`)
    await runCmd(`git add .`)
    await runCmd(`git commit -m "feat: first commit"`)
    this.spinner.succeed('脚手架初始化完成,请输入:')
    console.log(chalk.green(`cd ${this.name} && npm run dev`))
  }
}
module.exports = Creator
