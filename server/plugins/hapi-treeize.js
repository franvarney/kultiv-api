const HapiTreeize = require('hapi-treeize')

module.exports = {
  register: HapiTreeize,
  options: {
    output: {
      prune: false
    }
  }
}
