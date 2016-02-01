const DB = require('../../server/connections/postgres');

const CookbooksRecipes = {
  tableName: 'cookbooks_recipes',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('cookbook_id').unsigned().references('id').inTable('cookbooks');
    table.integer('recipe_id').unsigned().references('id').inTable('recipes');
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('cookbooks_recipes').insert([
      {
        cookbook_id: 1,
        recipe_id: 1
      },
      {
        cookbook_id: 2,
        recipe_id: 2
      },
      {
        cookbook_id: 3,
        recipe_id: 1
      },
      {
        cookbook_id: 3,
        recipe_id: 3
      }
    ]);
  }
};
