const Manager = require('knex-schema');

const DB = require('../../server/connections/postgres');

const manager = new Manager(DB);

const Units = {
  tableName: 'units',
  build: function (table) {
    table.increments('id').primary();
    table.string('name');
  },
  populate: function (database) {
    return database.knex('units').insert([
      { name: 'servings' },
      { name: 'cups' },
      { name: 'teaspoons' }
    ]);
  }
};

module.exports = Units;
