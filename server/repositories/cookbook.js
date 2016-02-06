'use strict';

const Base = require('./base');
const CookbookModel = require('../models/cookbook');

const TABLE_NAME = 'cookbooks';

class Cookbook extends Base {
  constructor() {
    super(TABLE_NAME, CookbookModel);
  }

  findByOwner(ownerUserId, done) {
    this.db
      .where('owner_id', ownerUserId)
      .whereNull('deleted_at')
      .then((cookbooks) => done(null, cookbooks))
      .catch((err) => done(err));
  }

  findByCollaborator(collaboratorUserId, done) {
    this.db
      .innerJoin('cookbooks-collaborators AS CC', 'cookbooks.id', 'CC.collaborator_id')
      .whereNull('cookbooks.deleted_at')
      .where('CC.collaborator_id', collaboratorUserId)
      .then((cookbooks) => done(null, cookbooks))
      .catch((err) => done(err));
  }
}

module.exports = new Cookbook();
