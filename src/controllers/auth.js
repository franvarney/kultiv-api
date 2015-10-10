// const Debug = require('debug')('cookbook/src/controllers/auth');

exports.validate = function (token, callback) {
  const User = this.server.plugins['hapi-mongo-models'].User;

  User.findByToken(token, function (err, user) {
    if (err) return callback(err);

    if (user) {
      callback(null, true, { token: token });
    } else {
      callback(null, false, { token: token });
    }
  });
};
