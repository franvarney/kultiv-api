function validate(token, callback) {
  const User = this.server.plugins['hapi-mongo-models'].User;

  User.findByToken(token, (err, user) => {
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

export default {
  validate: validate
};
