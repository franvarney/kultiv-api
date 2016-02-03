'use strict';

const CookbookModel = require('../models/cookbook');
const DB = require('../connections/postgres');

class Cookbook extends Base {
  constructor() {
    super('cookbooks', CookbookModel);
  }
}

module.exports = new Cookbook();
