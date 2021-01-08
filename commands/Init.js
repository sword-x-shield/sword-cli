const inquirer = require('inquirer')
const ora = require('ora')
const path = require('path')
const fs = require('fs-extra')
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
        this.cmdParams = parseCmdParams(destination)
        this.spinner = ora()
        this.init()
    }
    async init() {
        this.name || await this.askAndSetName()
        await this.askAndSetTemplate()
        const targetPath = this.getAbsPath()
        await this.checkFolderExist(targetPath);
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
    // 生成目标文件夹的绝对路径
    genTargetPath(relPath) {
        return path.resolve(process.cwd(), relPath);
    }
    // 获取绝对路径
    getAbsPath() {
        return this.genTargetPath(this.name)
    }
    // 检查文件夹是否存在
    checkFolderExist(targetPath) {
        return new Promise(async (resolve, reject) => {
            // 如果create附加了--force或-f参数，则直接执行覆盖操作
            if (this.cmdParams.force) {
                await fs.removeSync(targetPath)
                return resolve()
            }
            try {
                // 否则进行文件夹检查
                const isTarget = await fs.pathExistsSync(targetPath)
                if (!isTarget) {
                    return resolve()
                }
                const {
                    recover
                } = await inquirer.prompt(InquirerConfig.folderExist);
                if (recover === 'cover') {
                    await fs.removeSync(targetPath);
                    return resolve();
                } else if (recover === 'newFolder') {
                    const {
                        newName
                    } = await inquirer.prompt(InquirerConfig.rename);
                    this.name = newName;
                    return resolve();
                } else {
                    exit(1);
                }
            } catch (error) {
                log.error(`${error}`)
                exit(1);
            }
        })
    }
    /**
     * @todo 实现下载
     */
    async download() {

    }
    // 更新package.json中的信息
    async updatePkgFile() {
        this.spinner.start('正在更新package.json...');
        const pkgPath = path.resolve(this.getAbsPath(), 'package.json');
        const unnecessaryKey = ['keywords', 'license', 'files']
        const {
            name = '', email = ''
        } = await getGitUser();

        const jsonData = fs.readJsonSync(pkgPath);
        unnecessaryKey.forEach(key => delete jsonData[key]);
        Object.assign(jsonData, {
            name: this.name,
            author: name && email ? `${name} ${email}` : '',
            provide: true,
            version: "1.0.0"
        });
        await fs.writeJsonSync(pkgPath, jsonData, {
            spaces: '\t'
        })
        this.spinner.succeed('package.json更新完成！');
    }
    // 初始化git
    async initGit() {
        this.spinner.start('正在初始化Git管理项目...');
        const absPath = this.getAbsPath()
        await runCmd(`cd ${absPath}`);
        // 将node当前的工作目录改成项目目录
        process.chdir(absPath);
        await runCmd(`git init`);
        this.spinner.succeed('Git初始化完成！');
    }
    /**
     * @todo 安装依赖，执行first commit，提示用户cd目录运行项目
     */
    async runApp() {

    }
}
module.exports = Creator