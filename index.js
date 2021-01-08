#!/usr/bin/env node 
const { program } = require('commander')
const fs =require("fs");

program
    .version('0.1.0')  // --version 版本
    .command('init') // 初始化命令
    .description('初始化项目文件')
    .action( () => {
        const data = fs.readFileSync('./config/banner.txt');
        console.log(data.toString());      
        require('./action.js')()
    })

program.parse(process.argv) // 解析变量