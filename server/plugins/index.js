const HapiHawk = require('hapi-auth-hawk')

const HapiTreeize = require('./hapi-treeize')
const Reformat = require('./reformat')

module.exports = [
  HapiHawk,
  HapiTreeize,
  Reformat
]
