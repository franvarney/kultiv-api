const DB = require('../../server/connections/postgres');

const Cookbooks = {
  tableName: 'cookbooks',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('name').notNullable().index();
    table.string('description').nullable();
    table.boolean('is_private').defaultTo(false);
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('cookbooks').insert([
      {
        user_id: 1,
        name: 'Cookbook 11',
        description: 'This is cookbook #1',
        is_private: true
      },
      {
        user_id: 1,
        name: 'Cookbook 12',
        description: null
      },
      {
        user_id: 2,
        name: 'Cookbook 21',
        description: 'This is cookbook #21'
      },
      {
        user_id: 2,
        name: 'Cookbook 22',
        description: 'This is cookbook #22'
      },
      {
        user_id: 3,
        name: 'Cookbook 31',
        description: 'This is cookbook #31'
      },
      {
        user_id: 3,
        name: 'Cookbook 32',
        description: 'This is cookbook #32',
        is_private: true
      }
    ]);
  }
};

module.exports = Cookbooks;
