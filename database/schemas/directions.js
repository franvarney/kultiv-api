const DB = require('../../server/connections/postgres');

const Directions = {
  tableName: 'directions',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.text('direction');
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('directions').insert([
      {
        direction: 'Some directions go here.',
      },
      {
        direction: 'More directions...blah blah blah.',
      },
      {
        direction: 'There really needs to be more directions here than just one line.',
      },
      {
        direction: 'Some directions go here.',
      },
      {
        direction: 'More directions...blah blah blah.',
      },
      {
        direction: 'There really needs to be more directions here than just one line.',
      }
    ]);
  }
};
