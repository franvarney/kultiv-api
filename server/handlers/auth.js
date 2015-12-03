// const Debug = require('debug')('cookbook/src/controllers/auth');

exports.validate = function (token, callback) {
  const User = this.server.plugins['hapi-mongo-models'].User;

  User.findByToken(token, function (err, user) {
    if (err) return callback(err);

    if (user) {
      callback(null, true, {
        token: token ,
        user: {
          id: user._id, // eslint-disable-line no-underscore-dangle
          username: user.username
        }
      });
    } else {
      callback(null, false, { token: token });
    }
  });
};
