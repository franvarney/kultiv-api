const Debug = require('debug')('connections:postgres');
const Knex = require('knex');
const Schema = require('knex-schema');

const Config = require('../../config');

const knex = Knex({
  client: 'pg',
  connection: Config.postgres.uri,
  debug: Config.env !== 'production'
});

knex.raw('SELECT 1 + 1 as result')
    .then(() => {
      Debug(`knex connected successfully!`);
    })
    .catch((err) => {
      Debug(`knex connected unsuccessfully: ${err.message}`);
    });

module.exports = knex;
