const DB = require('../../server/connections/postgres');

const RecipesIngredients = {
  tableName: 'recipes_ingredients',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('recipe_id').unsigned().references('id').inTable('recipes');
    table.integer('ingredient_id').unsigned().references('id').inTable('ingredients');
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('recipes_ingredients').insert([
      {
        recipe_id: 1,
        ingredient_id: 1
      },
      {
        recipe_id: 1,
        ingredient_id: 2
      },
      {
        recipe_id: 1,
        ingredient_id: 3
      },
      {
        recipe_id: 2,
        ingredient_id: 2
      },
      {
        recipe_id: 3,
        ingredient_id: 3
      }
    ]);
  }
};

module.exports = RecipesIngredients;
