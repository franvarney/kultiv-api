const Foods = {
  tableName: 'foods',
  timestamps: false,
  build: function (table) {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
  },
  populate: function (database) {
    return database('foods').insert([
      {
        name: 'apples'
      },
      {
        name: 'mandarins'
      },
      {
        name: 'chicken breasts'
      },
      {
        name: 'spaghetti'
      },
      {
        name: 'ground beef'
      },
      {
        name: 'sugar'
      },
      {
        name: 'flour'
      },
      {
        name: 'sharp cheddar cheese'
      }
    ]);
  }
};

module.exports = Foods;
