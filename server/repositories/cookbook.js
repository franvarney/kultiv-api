'use strict'

const Treeize = require('treeize')

const Base = require('./base')
const CookbookModel = require('../models/cookbook')

const treeize = new Treeize({ output: { prune: false } })

const TABLE_NAME = 'cookbooks'

class Cookbook extends Base {
  constructor () {
    super(TABLE_NAME, CookbookModel)
  }

  findByOwner (ownerUserId, done) {
    this.knex('users')
      .select('users.*', 'C.id AS cookbooks:id', 'C.name AS cookbooks:name',
              'C.description AS cookbooks:description',
              'C.is_private AS cookbooks:is_private',
              'C.created_at AS cookbooks:created_at',
              'C.updated_at AS cookbooks:updated_at')
      .where('users.id', ownerUserId)
      .innerJoin('cookbooks as C', 'users.id', 'C.owner_id')
      .then((userCookbook) => {
        userCookbook = treeize.grow(userCookbook).getData()[0]
        delete userCookbook.password
        delete userCookbook.auth_token

        done(null, userCookbook)
      })
      .catch((err) => done(err))
  }

  findByCollaborator (collaboratorUserId, done) {
    this.knex(this.name)
      .innerJoin('cookbooks-collaborators AS CC', 'cookbooks.id',
                 'CC.collaborator_id')
      .whereNull('cookbooks.deleted_at')
      .where('CC.collaborator_id', collaboratorUserId)
      .then((cookbooks) => done(null, cookbooks))
      .catch((err) => done(err))
  }
}

module.exports = new Cookbook()
