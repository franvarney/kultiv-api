const Debug = require('debug')('connections:postgres')
const Knex = require('knex')

const {env, postgres} = require('../../config')

let knex = Knex({
  client: 'pg',
  connection: postgres.uri,
  debug: env !== 'production'
})

knex
  .raw('SELECT 1 + 1 as result')
  .asCallback((err) => {
    if (err) return Debug(`knex connected unsuccessfully: ${err.message}`)
    return Debug('knex connected successfully!')
  })

module.exports = knex
