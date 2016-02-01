const DB = require('../../server/connections/postgres');

const CookbooksCollaborators = {
  tableName: 'cookbooks_collaborators',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('cookbook_id').unsigned().references('id').inTable('cookbooks');
    table.integer('collaborator_id').unsigned().references('id').inTable('users');
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('cookbooks_collaborators').insert([
      {
        cookbook_id: 1,
        collaborator_id: 2
      },
      {
        cookbook_id: 2,
        collaborator_id: 3
      },
      {
        cookbook_id: 1,
        collaborator_id: 1
      }
    ]);
  }
};
module.exports = CookbooksCollaborators;