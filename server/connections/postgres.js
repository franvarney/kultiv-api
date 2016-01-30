const BookShelf = require('bookshelf');
const Debug = require('debug')('connections:postgres');
const Knex = require('knex');

const Config = require('../../config');

const knex = Knex({
  client: 'pg',
  connection: Config.postgres.uri,
  debug: Config.env !== 'production' ? true : false,
  migrations: {
    tableName: 'migrations'
  }
});

knex.raw('SELECT 1 + 1 as result')
    .then(() => {
      Debug(`knex connected successfully!`);
    })
    .catch((err) => {
      Debug(`knex connected unsuccessfully: ${err.message}`);
    });

module.exports = BookShelf(knex);
