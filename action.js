const inquirer = require('inquirer'); 

function askProjectDetail(){
  const templateList = require('./config/template.json')
  const packageList = require('./config/packageList.json')
  const templateNameList = []
  const packageNameList = []
  for (item in templateList) {
    templateNameList.push(item)
  }
  for (item in packageList) {
    packageNameList.push(item)
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
    {
      type: 'checkbox',
      name: 'package',
      message: '请选择项目需要的依赖:',
      choices: [{
        name:'axios'
      },{
        name:'Vuex'
      }],
    },
  ])
  .then(answers => {

      // require('./download.js')(templateList[answers.template], `${answers.name}`, '')
  })
  .catch(error => {
    if(error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  })
}

module.exports = askProjectDetail