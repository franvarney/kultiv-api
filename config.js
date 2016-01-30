/* eslint-disable no-process-env */
module.exports = {
  admin_token: process.env.ADMIN_TOKEN || 'C00kbook',
  env: process.env.NODE_ENV,
  host: process.env.HOST || 'localhost',
  postgres: {
    uri: process.env.POSTGRES_URI || 'postgres://user:pass@port:5432/databaseName?ssl=true'
  },
  port: process.env.PORT || 3000
};
/* eslint-enable no-process-env */
