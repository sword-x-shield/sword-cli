const fse = require('fs-extra')
const {
  genTargetPath
} = require('./utils')
const path = require('path')

async function useVuex(relPath) {
  // await fse.ensureDir(path.resolve(genTargetPath(relPath), 'src/store'), function(err) {
  //   log.error(`[sword-cli]Error:${err}`)
  // })
  await fse.copySync(path.resolve('./cli-plugin-vuex/generator'), path.resolve(genTargetPath(relPath), 'src'))
}

module.exports = {
  vuex: useVuex
}
