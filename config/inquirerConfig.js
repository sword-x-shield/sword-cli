const templateList = require('./template.json')
module.exports = {
    // 输入项目名参数
    name: {
        type: 'input',
        name: 'name',
        message: '请输入项目名称:',
        default: function () {
            return 'sword-cli-project'
        }
    },
    // 选择模板参数
    template: {
        type: 'list',
        name: 'template',
        message: '请选择模板:',
        choices: Object.keys(templateList),
    },
    // 文件夹已存在的名称的询问参数
    folderExist: [{
        type: 'list',
        name: 'recover',
        message: '当前文件夹已存在，请选择操作：',
        choices: [
        { name: '创建一个新的文件夹', value: 'newFolder' },
        { name: '覆盖', value: 'cover' },
        { name: '退出', value: 'exit' },
        ]
    }],
    // 重命名的询问参数
    rename: [{
        name: 'inputNewName',
        type: 'input',
        message: '请输入新的项目名称: '
    }]
}