const chalk = require('chalk')
const childProcess = require('child_process')
const execa = require('execa')
const path = require('path')
// 封装log函数
exports.log = {
  warning(msg = '') {
    console.log(chalk.yellow(`${msg}`))
  },
  error(msg = '') {
    console.log(chalk.red(`${msg}`))
  },
  success(msg = '') {
    console.log(chalk.magenta(`${msg}`))
  }
}

// 获取当前用户git信息
exports.getGitUser = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async(resolve, reject) => {
    const user = {}
    try {
      const [name] = await this.runCmd('git config user.name')
      const [email] = await this.runCmd('git config user.email')
      if (name) user.name = name.replace(/\n/g, '')
      if (email) user.email = `<${email || ''}>`.replace(/\n/g, '')
    } catch (error) {
      this.log.error('获取用户Git信息失败')
      reject(error)
    } finally {
      resolve(user)
    }
  })
}

// 判断是否是函数
exports.isFunction = (val) => {
  return typeof val === 'function'
}

// 解析用户输入的参数
exports.parseCmdParams = (cmd) => {
  if (!cmd) return {}
  const resOps = {}
  cmd.options.forEach(option => {
    const key = option.long.replace(/^--/, '')
    if (cmd[key] && !this.isFunction(cmd[key])) {
      resOps[key] = cmd[key]
    }
  })
  return resOps
}

// 运行cmd命令
exports.runCmd = cmd => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, ...arg) => {
      if (err) return reject(err)
      return resolve(...arg)
    })
  })
}

// 运行cmd命令
exports.runInstallCmd = async(cmd, arg) => {
  const PACKAGE_MANAGER_CONFIG = {
    npm: {
      install: ['install', '--loglevel', 'error'],
      add: ['install', '--loglevel', 'error'],
      upgrade: ['update', '--loglevel', 'error'],
      remove: ['uninstall', '--loglevel', 'error']
    },
    yarn: {
      install: [],
      add: ['add'],
      upgrade: ['upgrade'],
      remove: ['remove']
    }
  }
  const cwd = process.cwd()
  const child = await execa(cmd, PACKAGE_MANAGER_CONFIG[cmd][arg], {
    cwd,
    stdio: ['inherit', 'inherit', 'inherit']
  })
  child.stdout.on('data', buffer => {
    process.stdout.write(buffer)
  })
  child.on('close', code => {
    if (code !== 0) {
      throw new Error(`command failed: ${cmd}`)
    }
  })
}

// 生成目标文件夹的绝对路径
exports.genTargetPath = relPath => {
  return path.resolve(process.cwd(), relPath)
}
