'use strict'

const Base = require('./base')
const DirectionModel = require('../models/direction')

const TABLE_NAME = 'foods'

class Direction extends Base {
  constructor () {
    super(TABLE_NAME, DirectionModel)
  }

  findById (id, done) {
    this.knex(this.name)
      .where('id', id)
      .first('id', 'direction')
      .then((direction) => done(null, direction))
      .catch((err) => done(err))
  }
}

module.exports = new Direction()
