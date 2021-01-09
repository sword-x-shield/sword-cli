const fse = require('fs-extra')
const fs = require('fs')
const {
  genTargetPath
} = require('./utils')
const path = require('path')

async function useVuex(relPath) {
  const targetPath = genTargetPath(relPath)
  const templateString = await fs.readFileSync(path.resolve(path.join(__dirname, './cli-plugin-vuex/index.js')), 'utf-8')
  // 重写mian文件import store
  if (await fse.pathExistsSync(path.resolve(targetPath, 'src/main.js') === true)) {
    fs.writeFileSync(path.resolve(targetPath, 'src/main.js'), templateString)
  } else {
    fs.writeFileSync(path.resolve(targetPath, 'src/main.ts'), templateString)
  }
  // 导入store仓库
  await fse.copySync(path.resolve(path.join(__dirname, './cli-plugin-vuex/generator')), path.resolve(targetPath, 'src'))
}

/**
 * todo 增加axios基础配置
 */
async function useAxios() {

}

module.exports = {
  vuex: useVuex,
  axios: useAxios
}
