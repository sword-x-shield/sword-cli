const git = require('git-promise')
const ora = require('ora')
const chalk = require('chalk')
const fs = require('fs')

async function downloadFile(repoPath, localPath, branch) {
  const _branch = branch ? `-b ${branch} --` : '--'
  const _repoPath = `clone ${_branch} ${repoPath} ./${localPath}`
  if (!fs.existsSync(localPath)) {
    const spinner = ora('正在下载模板,请稍等...').start()
    spinner.color = 'blue'
    try {
      await git(_repoPath)
      spinner.succeed('初始化完成,请输入:')
      console.log(chalk.green(`cd ${localPath} && npm install && npm run dev`))
      // 删除git文件追踪
      await fs.rmdir(`./${localPath}/.git`, { recursive: true }, err => {
        if (!err) { console.log('') } else console.log(`无法删除git文件追踪${err}`)
      })
    } catch (error) {
      spinner.stop()
    }
  } else {
    console.log('已存在指定目录')
  }
}

module.exports = downloadFile
