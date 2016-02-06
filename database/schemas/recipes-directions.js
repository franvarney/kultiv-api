const DB = require('../../server/connections/postgres');

const RecipesDirections = {
  tableName: 'recipes_directions',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('recipe_id').unsigned().references('id').inTable('recipes');
    table.integer('direction_id').unsigned().references('id').inTable('directions');
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('recipes_directions').insert([
      {
        recipe_id: 1,
        direction_id: 1
      },
       {
        recipe_id: 1,
        direction_id: 2
      },
      {
        recipe_id: 2,
        direction_id: 2
      },
      {
        recipe_id: 3,
        direction_id: 3
      }
    ]);
  }
};

module.exports = RecipesDirections;
