exports.packageList = {
  'axios': {
    'isSingel': true,
    'version': '^0.19.2'
  },
  'vuex': {
    'isSingel': true,
    'version': '^3.4.0'
  },
  'eslint': {
    'isSingel': false,
    'children': {
      'eslint': ''
    }
  }
}

exports.getPackageInfo = (packageName) => {
  return this.packageList[packageName]
}
