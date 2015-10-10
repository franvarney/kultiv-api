const Boom = require('boom');
// const Debug = require('debug')('cookbook/src/controllers/user');
const Waterfall = require('run-waterfall');

exports.create = function (request, reply) {
  const User = request.server.plugins['hapi-mongo-models'].User;

  Waterfall([
    function (callback) {
      User.isExisting(
        request.payload.email,
        request.payload.username,
        function (err, isExisting) {
          if (err) return callback(err);
          if (isExisting) {
            return callback({ message: 'User already exists' });
          }
          callback();
        });
    },
    User.hashPassword.bind(null, request.payload.password),
    function (hashedPassword, callback) {
      User.validate({
        email: request.payload.email,
        username: request.payload.username,
        password: hashedPassword
      }, callback);
    },
    function (validatedUser, callback) {
      User.insertOne(validatedUser, callback);
    }
  ], function (err, user) {
    if (err) return reply(Boom.badRequest(err.message));
    reply(user[0].username);
  });
};

exports.delete = function (request, reply) {
  const User = request.server.plugins['hapi-mongo-models'].User;

  Waterfall([
    User.isExisting.bind(null, null, request.params.username),
    function (user, callback) {
      if (!user) return callback({ message: 'User not found' });
      User.deleteOne(
        { username: request.params.username },
        function (err) {
        if (err) return callback(err);
        callback();
      });
    }
  ], function (err) {
    if (err) return reply(Boom.notFound(err.message));
    reply({ success: true });
  });
};

exports.find = function (request, reply) {
  const User = request.server.plugins['hapi-mongo-models'].User;

  Waterfall([
    User.isExisting.bind(null, null, request.params.username),
    function (user, callback) {
      if (!user) return callback({ message: 'User not found' });
      User.findOne(
        { username: request.params.username },
        function (err, foundUser) {
        if (err) return callback(err);
        callback(null, foundUser);
      });
    }
  ], function (err, foundUser) {
    if (err) return reply(Boom.notFound(err.message));
    delete foundUser.password;
    reply(foundUser);
  });
};

exports.update = function (request, reply) {
  var user;
  const User = request.server.plugins['hapi-mongo-models'].User;

  Waterfall([
    User.isExisting.bind(
      null,
      request.payload.email,
      request.payload.username
    ),
    function (existingUser, callback) {
      if (!existingUser) {
        return callback({ message: 'User not found' });
      }
      callback(null, existingUser);
    },
    function (existingUser, callback) {
      if (request.payload.password) {
        User.isPasswordMatch(
          request.payload.password,
          existingUser.password,
          function (err, isMatch) {
            if (err) return callback(err);
            callback(null, isMatch);
          });
      } else {
        callback(null, true);
      }
    },
    function (isMatch, callback) {
      if (!isMatch) {
        User.hashPassword(
          request.payload.password,
          function (err, hashedPassword) {
          if (err) return callback(err);
          callback(null, hashedPassword);
        });
      } else {
        callback(null, false);
      }
    },
    function (hashedPassword, callback) {
      user = {
        email: request.payload.email,
        location: request.payload.location,
        updated: Date.now()
      };

      if (hashedPassword) user.password = hashedPassword;

      User.validate(user, function (err, validatedUser) {
        if (err) return callback(err);
        callback(null, validatedUser);
      });
    },
    function (validatedUser, callback) {
      User.updateOne(
        { username: request.payload.username },
        validatedUser,
        function (err) {
        if (err) return callback(err);
        callback();
      });
    }
  ], function (err) {
    if (err) return reply(Boom.badRequest(err.message));
    reply(request.params.username);
  });
};
