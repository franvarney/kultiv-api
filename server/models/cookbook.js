const Logger = require('franston')('server:models:cookbook')

const Model = require('./base')
const CookbookSchema = require('../schemas/cookbook')

const TABLE_NAME = 'cookbooks'

const Cookbook = Model.createModel({
  name: TABLE_NAME,
  schema: CookbookSchema.general,

  findByOwner (done) {
    Logger.debug('cookbook.findByOwner')

     // TODO find owner first?

    this.knex(this.name)
      .select('cookbooks.id', 'cookbooks.name', 'cookbooks.description',
              'cookbooks.is_private','cookbooks.created_at',
              'cookbooks.updated_at', 'U.id AS creator:id',
              'U.username AS creator:username')
      .innerJoin('users AS U', 'U.id', 'cookbooks.owner_id')
      .where('owner_id', this.data.owner_id)
      .whereNull('cookbooks.deleted_at')
      .asCallback((err, cookbook) => {
        if (err) return this._errors(err, done)
        return done(null, cookbook)
      })
  },

  findByCollaborator (done) {
    Logger.debug('cookbook.findByCollaborator')

    // TODO find collaborator first?

    this.knex(this.name)
      .innerJoin('cookbooks-collaborators AS CC', 'cookbooks.id',
                 'CC.collaborator_id')
      .whereNull('cookbooks.deleted_at')
      .where('CC.collaborator_id', this.data.collaborator_id)
      .whereNull('deleted_at')
      .asCallback((err, cookbooks) => {
        if (err) return this._errors(err, done)
        return done(null, cookbooks)
      })
  }
})

module.exports = Cookbook
