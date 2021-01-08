const chalk = require('chalk')
const childProcess = require('child_process')
const runCmd = require('../utils')
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
      const [name] = await runCmd('git config user.name')
      const [email] = await runCmd('git config user.email')
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
