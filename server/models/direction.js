const Base = require('./base')
const DirectionSchema = require('../schemas/direction')

const TABLE_NAME = 'directions'

class Direction extends Base {
  constructor () {
    super(TABLE_NAME, DirectionSchema)
  }

  findById (id, done) {
    this.knex(this.name)
      .where('id', id)
      .first('id', 'direction')
      .asCallback((err, direction) => {
        if (err) return done(err)
        return done(null, direction)
      })
  }
}

module.exports = new Direction()
