const Logger = require('franston')('server:models:direction')

const Base = require('./base')
const DirectionSchema = require('../schemas/direction')

const TABLE_NAME = 'directions'

class Direction extends Base {
  constructor () {
    super(TABLE_NAME, DirectionSchema)
  }

  findById (id, done) {
    Logger.debug('direction.findById')

    this.knex(this.name)
      .where('id', id)
      .first('id', 'direction')
      .asCallback((err, direction) => {
        if (err) return Logger.error(err), done(err)
        return done(null, direction)
      })
  }
}

module.exports = new Direction()
