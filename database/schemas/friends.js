const DB = require('../../server/connections/postgres');

const Friends = {
  tableName: 'friends',
  timestamps: true,
  timestampFn: DB.fn.now(),
  build: function (table) {
    table.increments('id').primary();
    table.integer('initiator_id').unsigned().references('id').inTable('users');
    table.integer('recipient_id').unsigned().references('id').inTable('users');
    table.enu('status', 'pending, accepted, rejected');
    table.timestamp('deleted_at').nullable();
  },
  populate: function (database) {
    return database('friends').insert([
      {
        initiator_id: 1,
        recipient_id: 2,
        status: 'pending'
      },
      {
        initiator_id: 2,
        recipient_id: 3,
        status: 'accepted'
      },
      {
        initiator_id: 3,
        recipient_id: 1,
        status: 'rejected'
      }
    ]);
  }
};

module.exports = Friends;
