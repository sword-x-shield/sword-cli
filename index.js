#!/usr/bin/env node 
const { program } = require('commander')
const inquirer = require('inquirer'); 
const fs =require("fs");

program
    .version('0.1.0')  // --version 版本
    .command('init') // 初始化命令
    .description('初始化项目文件')
    .action( () => {
        const data = fs.readFileSync('./config/banner.txt');
        console.log(data.toString());      
        const templateList = require('./config/template.json')
        const templateNameList = []
        for (item in templateList) {
          templateNameList.push(item)
        }
        inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: '请输入项目名:',
            default: function () {
              return 'sword-cli-project'
            },
          },
          {
            type: 'list',
            name: 'template',
            message: '请选择模板:',
            choices: templateNameList,
          },
        ])
        .then(answers => {
            require('./download.js')(templateList[answers.template], `${answers.name}`, '')
        })
    })

program.parse(process.argv) // 解析变量