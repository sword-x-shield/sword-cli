#!/usr/bin/env node 
const { program } = require('commander')
const InitCommand = require('./commands/Init')
const fs =require("fs");
// 导入根目录下package.json
const package = require('./package')

const showBanner = () => {
  const data = fs.readFileSync('./config/banner.txt')
  console.log(data.toString())
}
// 无论什么命令都先显示一个banner
showBanner() 

program
    .version(package.version, '-v, --version', '显示sword-cli的当前版本')  // --version 版本
    .usage('<command> [options]');

program
    .command('init [name]') // 初始化命令
    .description('初始化项目文件')
    .option('-f, --force', '忽略文件夹检查，如果已存在则直接覆盖')
    .action( (projectName, destination) => {
        new InitCommand(projectName, destination)
        // .then(answers => {
        //     require('./download.js')(templateList[answers.template], `${answers.name}`, '')
        // })
        // .catch(error => {
        //   if(error.isTtyError) {
        //     // Prompt couldn't be rendered in the current environment
        //   } else {
        //     // Something else when wrong
        //   }
        // })
    })



program.parse(process.argv) // 解析变量