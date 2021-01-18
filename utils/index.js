const chalk = require('chalk')
const childProcess = require('child_process')
const execa = require('execa')
const { existsSync } = require('fs')
const path = require('path')
const address = require('address')
const defaultGateway = require('default-gateway')
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
  },
  logObj(obj) {
    let result = ''
    Object.entries(obj).forEach(([key, val]) => {
      if (val === undefined) {
        return
      }
      result += '\n'
      result += `${key}:\t${(formatVal(val))}`
    })
    console.log(result)

    function formatVal(val) {
      if (/https?/.test(val)) {
        return chalk.cyan(val)
      }
      return val
    }
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

exports.getWebpcakConfig = (configPath) => {
  // 如果指定配置文件路径
  if (configPath) {
    // 判断前缀如果是本地文件则进行路径拼接进行获取
    if (this.isLocalPath()) {
      configPath = this.getLocalPath(configPath)
    } else {
      throw new Error(`--config \` ${configPath}\` 不符合本地文件格式 `)
    }
    if (existsSync(configPath)) {
      this.log.error(`\n File not exist: ${configPath}\n`)
    }
  } else {
    // 兜底---走默认路径
    configPath = path.resolve('.', 'sword.config.js')
    if (!existsSync(configPath)) { // 兼容webpack.config.js
      configPath = path.resolve('.', 'webpack.config.js')
    }
    if (!existsSync(configPath)) {
      configPath = null
    }
  }

  return configPath
}

exports.isLocalPath = (templatePath) => {
  return /^[./]|(^[a-zA-Z]:)/.test(templatePath)
}

exports.getLocalPath = (templatePath) => {
  // 传入绝对路径直接使用否则进行路径拼接
  return path.isAbsolute(templatePath) ? templatePath : path.normalize(path.join(process.cwd(), templatePath))
}

/**
 * 获得本机的内网ipv4地址
 * @returns {string | undefined} 如果为undefined则代表找不到
 */
exports.networkAddress = () => {
  const result = defaultGateway.v4.sync()
  const lanUrlForConfig = address.ip(result && result.interface)
  if (lanUrlForConfig) {
    return lanUrlForConfig
  } else {
    return undefined
  }
}
