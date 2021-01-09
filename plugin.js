const fse = require('fs-extra')
const fs = require('fs')
const {
  genTargetPath
} = require('./utils')
const path = require('path')

async function useVuex(relPath) {
  const targetPath = genTargetPath(relPath)
  if (await fse.pathExistsSync(path.resolve(targetPath, 'src/main.js') === true)) {
    console.log(fs.readFileSync(path.resolve(targetPath, 'src/main.js'), 'utf-8'))
  } else {
    const templateString = await fs.readFileSync(path.resolve(path.join(__dirname, './cli-plugin-vuex/index.js')), 'utf-8')
    fs.writeFileSync(path.resolve(targetPath, 'src/main.ts'), templateString)
  }
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
