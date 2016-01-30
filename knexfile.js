const Config = require('./config');

module.exports = {
  development: {
    client: 'pg',
    connection: Config.postgres.uri,
    migrations: {
      directory: './database/migrations',
      tableName: 'migrations'
    }
  },
  staging: {
    client: 'pg',
    connection: Config.postgres.uri,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },
  production: {
    client: 'pg',
    connection: Config.postgres.uri,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  }
};
