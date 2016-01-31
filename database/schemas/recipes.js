const DB = require('../../server/connections/postgres');

const Recipes = {
  tableName: 'recipes',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('title', 255).index().unique().notNullable();
    table.integer('prep_time').unsigned().notNullable();
    table.integer('cook_time').unsigned().notNullable();
    table.integer('yield_amount').unsigned().notNullable();
    table.integer('yield_unit_id').unsigned().references('id').inTable('units');
    table.string('description').nullable();
    table.boolean('is_private').defaultTo(false);
    table.timestamp('deleted_at');
  },
  populate: function (database) {
    return database('recipes').insert([
      {
        user_id: 1,
        title: "Edgar's awesome cookies",
        prep_time: 2200,
        cook_time: 1200,
        yield_amount: 2,
        yield_unit_id:1,
        description: "Too darn good",
        is_private: true,
        deleted_at: new Date().toLocaleString()
    }
  ]);
  }
};

module.exports = Recipes;