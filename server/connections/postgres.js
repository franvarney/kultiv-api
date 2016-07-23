const Logger = require('franston')('connections:postgres')
const Knex = require('knex')

const Config = require('../../config')

let knex = Knex({
  client: 'pg',
  connection: Config.postgres.uri,
  debug: Config.knex.debug == true
})

knex
  .raw('SELECT 1 + 1 as result')
  .asCallback((err) => {
    if (err) return Logger.error('knex connected unsuccessfully'), err
    return Logger.info('knex connected successfully!')
  })

module.exports = knex
