const Units = {
  tableName: 'units',
  timestamps: false,
  build: function (table) {
    table.increments('id').primary();
    table.string('name', 50).notNullable().index().unique();
  },
  populate: function (database) {
    return database('units').insert([
      { name: 'servings' },
      { name: 'cups' },
      { name: 'teaspoons' }
    ]);
  }
};

module.exports = Units;
