const Units = {
  tableName: 'units',
  build: function (table) {
    table.increments('id').primary().index();
    table.string('name', 50).isNotNullable().index().unique();
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
