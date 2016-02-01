const DB = require('../../server/connections/postgres');

const Ingredients = {
  tableName: 'ingredients',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.decimal('amount', 2).notNullable();
    table.integer('unit_id').unsigned().references('id').inTable('units');
    table.integer('food_id').unsigned().references('id').inTable('foods');
    table.boolean('optional').defaultTo(false);
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('ingredients').insert([
      {
        amount: 1,
        unit_id: 3,
        food_id: 6,
        optional true
      },
      {
        amount: 4.6,
        unit_id: 2,
        food_id: 3,
        optional false
      },
      {
        amount: 2,
        unit_id: 1,
        food_id: 3,
        optional false
      },
      {
        amount: 6.25,
        unit_id: 2,
        food_id: 6,
        optional true
      },
      {
        amount: 1.5,
        unit_id: 1,
        food_id: 1,
        optional false
      },
    ]);
  }
};

module.exports = Ingredients;
