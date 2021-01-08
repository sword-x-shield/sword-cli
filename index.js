#!/usr/bin/env node
const { program } = require('commander')
const InitCommand = require('./commands/Init')
const path = require('path')
const fs = require('fs')
// 导入根目录下package.json
const packageInfo = require('./package')

const showBanner = () => {
  const data = fs.readFileSync(path.join(__dirname, './config/banner.txt'))
  console.log(data.toString())
}
// 无论什么命令都先显示一个banner
showBanner()

program
  .version(packageInfo.version, '-v, --version', '显示sword-cli的当前版本') // --version 版本
  .usage('<command> [options]')

program
  .command('init [name]') // 初始化命令
  .description('初始化项目文件')
  .option('-f, --force', '忽略文件夹检查，如果已存在则直接覆盖')
  .action((projectName, destination) => {
    new InitCommand(projectName, destination)
  })

try {
    program.parse(process.argv);// 解析变量
} catch (error) {
    console.log('err: ', error)
}