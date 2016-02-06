'use strict';

const Base = require('./base');
const RecipeModel = require('../models/recipe');

const TABLE_NAME = 'recipes';

class Recipe extends Base {
  constructor() {
    super(TABLE_NAME, RecipeModel);
  }

  findByUser(userId, done) {
    this.db
      .where('user_id', userId)
      .then((recipes) => done(null, recipes))
      .catch((err) => done(err));
  }

  findByTitle(title, done) {
    this.db
      .where('title', 'LIKE', `%${title}%`)
      .then((recipes) => done(null, recipes))
      .catch((err) => done(err));
  }
}

module.exports = new Recipe();
