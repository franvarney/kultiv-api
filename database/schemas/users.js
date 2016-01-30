const uuid = require('uuid4');

const Users = {
  tableName: 'users',
  build: function (table) {
    table.increments('id').primary();
    table.string('username', 50).index().unique().notNullable();
    table.string('email').index().unique().notNullable();
    table.string('password').notNullable();

    table.string('first_name',50);
    table.string('last_name',50);
    table.string('location',50);

    table.boolean('is_admin').notNullable().defaultTo(false);
    table.uuid('auth_token').index().unique().notNullable();;
    table.timestamps();
    table.timestamp('deleted_at');
  },
  populate: function (database) {
    return database.knex('users').insert([
      {
          username: 'johndoe',
          email: 'johndoe@gmail.com',
          password: 'secret',
          first_name: 'John',
          last_name: 'Doe',
          location: '11368',
          is_admin: true,
          auth_token: uuid(),
          deleted_at: new Date().toLocaleString()
      }
    ]);
  }
};

module.exports = Users;