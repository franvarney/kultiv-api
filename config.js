/* eslint-disable no-process-env */
export default {
  admin_token: process.env.ADMIN_TOKEN || 'C00kbook',
  env: process.env.NODE_ENV,
  host: process.env.HOST || 'localhost',
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/Cookbook'
  },
  port: process.env.PORT || 3000,
  redis: {
    auth: {
      host: process.env.REDIS_AUTH_HOST,
      port: process.env.REDIS_AUTH_PORT
    }
  }
};
/* eslint-enable no-process-env */
