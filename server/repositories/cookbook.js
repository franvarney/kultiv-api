'use strict';

const Base = require('./base');
const CookbookModel = require('../models/cookbook');
const DB = require('../connections/postgres');
const User = require('./user');

const TABLE_NAME = 'cookbooks';

class Cookbook extends Base {
  constructor() {
    super(TABLE_NAME, CookbookModel);
  }

  findByOwner(ownerUserId, done) {
    this.db
      .where('owner_id', ownerUserId)
      .then((cookbooks) => done(null, cookbooks))
      .catch((err) => done(err));
  }

  findByCollaborator(collaboratorUserId, done) {
    this.db
      .innerJoin('cookbooks-collaborators as CC', 'id', 'CC.collaborator_id')
      .where('CC.collaborator_id', collaboratorUserId)
      .then((cookbooks) => done(null, cookbooks))
      .catch((err) => done(err));
  }

  create(payload, done) {
    User.findById(payload.user_id, (err, user) => {
      if (err) return done(err);
      if (!user) return done(err, false);
      this.add(validated, done);
    });
  }

  update(id, payload, done) {
    this.validate(payload, this.schema, (err, validated) => {
      if (err) return done(err);

      this.db
        .where('id', id)
        .update(payload)
        .returning('id')
        .then((id) => done(null, id))
        .catch((err) => done(err));
    });
  }

  toggleIsPrivate(id) {
    this.findById(id, (err, cookbook) => {
      if (err) return done(err);

      var isPrivate = true;
      if (cookbook.is_private) isPrivate = false;

      this.db
        .where('id', id)
        .update('is_private', isPrivate)
        .returning('id')
        .then((id) => done(null, id))
        .catch((err) => done(err));
    });
  }
}

module.exports = new Cookbook();
