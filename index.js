#!/usr/bin/env node
const { program } = require('commander')

const InitCommand = require('./commands/Init')
const ListCommand = require('./commands/List')
const StartCommand = require('./commands/Start')
const BuildCommand = require('./commands/Build')

const path = require('path')
const fs = require('fs')
// 导入根目录下package.json
const packageInfo = require('./package')
const leven = require('leven')
const chalk = require('chalk')

const showBanner = () => {
  const data = fs.readFileSync(path.join(__dirname, './config/banner.txt'))
  console.log(data.toString())
}
// 无论什么命令都先显示一个banner
showBanner()

program
  .name('sword')
  .version(packageInfo.version, '-v, --version', '显示sword-cli的当前版本') // --version 版本
  .helpOption('-h, --help', '显示sword-cli的帮助')
  .usage('<command> [options]')

program
  .command('init [name]') // 初始化命令
  .description('🚄 初始化项目文件')
  .usage('[name] [options]')
  .option('-f, --force', '忽略文件夹检查，如果已存在则直接覆盖')
  .action((projectName, destination) => {
    new InitCommand(projectName, destination)
  })

program
  .command('list')
  .description('🗒  列出当前库中包含的模板/可选库等等')
  .option('-t, --template', '列出当前脚手架所有的项目模板')
  .action(destination => {
    new ListCommand(destination)
  })

program
  .command('start')
  .description('🚁 启动本地服务构建并运行项目')
  .usage('<command> [options]')
  .option('-c, --config <type>', '指定项目构建配置文件')
  .action((destination) => {
    new StartCommand(destination)
  })

program
  .command('build')
  .description('📦 对项目资源进行打包构建')
  .usage('<command> [options]')
  .option('-c, --config <type>', '指定项目构建配置文件')
  .action((destination) => {
    new BuildCommand(destination)
  })

// 匹配未知的命令
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log()
    console.log(`  ` + chalk.red(`命令 ${chalk.yellow(cmd)} 不存在。`))
    console.log()
    suggestCommands(cmd)
    process.exitCode = 1
  })

// 什么都不输入时显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)// 解析变量
}

// 提出命令修正建议---vue-cli
function suggestCommands(unknownCommand) {
  // 获取命令集
  const availableCommands = program.commands.map(cmd => cmd._name)

  let suggestion

  // 使用编辑距离算法对找出最匹配的命令
  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`您是想使用 ${chalk.yellow(suggestion)} 命令吗?`))
  }
}
