const DB = require('../../server/connections/postgres');

const uuid = require('uuid4');

const Users = {
    tableName: 'users',
    timestamps: true,
    timestampFn: DB.fn.now(),
    build: function (table) {
        table.increments('id').primary();
        table.string('username', 50).index().unique().notNullable();
        table.string('email').index().unique().notNullable();
        table.string('password').notNullable();
        table.string('first_name',50);
        table.string('last_name',50);
        table.string('location',50);
        table.boolean('is_admin').notNullable().defaultTo(false);
        table.uuid('auth_token').index().unique().notNullable();
        table.timestamp('deleted_at');
    },
    populate: function (database) {
        return database('users').insert([
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
            },
            {
                username: 'samdoe',
                email: 'samdoe@gmail.com',
                password: 'secret',
                first_name: 'Sam',
                last_name: 'Doe',
                location: '11368',
                is_admin: true,
                auth_token: uuid()
            },
            {
                username: 'skyline',
                email: 'skyline@gmail.com',
                password: 'secret',
                first_name: 'Sky',
                last_name: 'Line',
                location: '45224',
                is_admin: false,
                auth_token: uuid()
            }
        ]);
    }
};

module.exports = Users;