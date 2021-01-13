const templateList = require('./template.json')
const { packageList } = require('./packageList.js')
module.exports = {
  // 输入项目名参数
  name: {
    type: 'input',
    name: 'name',
    message: '请输入项目名称:',
    default: function() {
      return 'sword-cli-project'
    }
  },
  // 选择模板参数
  template: {
    type: 'list',
    name: 'template',
    message: '请选择模板: ',
    choices: templateList.map(i => i.name)
  },
  // 包管理器参数
  manager: {
    type: 'list',
    name: 'manager',
    message: '请选择项目包管理器: ',
    choices: ['yarn', 'npm'],
    default: 'npm'
  },
  // 文件夹已存在的名称的询问参数
  folderExist: [{
    type: 'list',
    name: 'recover',
    message: '当前文件夹已存在，请选择操作: ',
    choices: [
      { name: '创建一个新的文件夹', value: 'newFolder' },
      { name: '覆盖', value: 'cover' },
      { name: '退出', value: 'exit' }
    ]
  }],
  // 重命名的询问参数
  rename: [{
    name: 'newName',
    type: 'input',
    message: '请输入新的项目名称: '
  }],
  // 可选依赖包参数
  isNeedPackage: [{
    name: 'isNeedPackage',
    type: 'list',
    message: '您当前选择为简易模板，需要加载额外的依赖吗？',
    choices: ['yes', 'no'],
    default: 'no'
  }],
  // 可选依赖包参数
  packageList: [{
    name: 'packageList',
    type: 'checkbox',
    message: '您当前选择为简易模板，请选择你需要额外加载的包: ',
    choices: Object.keys(packageList)
  }],
  // 询问eslint规则
  eslintType: [{
    name: 'eslintType',
    type: 'list',
    message: '请选择需要的eslint规则',
    choices: [
      { name: 'ESlint + Airbnb配置', value: 'airbnb' },
      { name: 'ESlint + 标准配置', value: 'standard' }
    ]
  }],
  // eslint校验时机
  eslintTime: [{
    name: 'eslintTime',
    type: 'checkbox',
    message: '请选择eslint的校验时机（可多选）',
    choices: [
      { name: '在保存时校验', value: 'save' },
      { name: '在git commit时校验并修复', value: 'commit' }
    ]
  }],
  // 询问配置文件放置位置
  configFilePlace: [{
    name: 'configFilePlace',
    type: 'list',
    message: '请选择ESlint配置文件放置的位置',
    choices: [
      { name: '放置在单独的配置文件', value: 'single' },
      { name: '放置在package.json中', value: 'package' }
    ]
  }]
}
