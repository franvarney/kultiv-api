import {badRequest, notFound} from 'boom';
import Waterfall from 'run-waterfall';

function create(request, reply) {
  let {payload, server} = request;
  const {User} = server.plugins['hapi-mongo-models'];

  Waterfall([
    function (callback) {
      User.isExisting(
        payload.email,
        payload.username,
        (err, isExisting) => {
          if (err) return callback(err);
          if (isExisting) {
            return callback({ message: 'User already exists' });
          }
          callback();
        });
    },
    User.hashPassword.bind(null, payload.password),
    function (hashedPassword, callback) {
      User.validate({
        email: payload.email,
        username: payload.username,
        password: hashedPassword
      }, callback);
    },
    function (validatedUser, callback) {
      User.insertOne(validatedUser, callback);
    }
  ], function (err, user) {
    if (err) return reply(badRequest(err.message));
    reply(user[0].username);
  });
}

function remove(request, reply) {
  let {params, server} = request;
  const {User} = server.plugins['hapi-mongo-models'];

  Waterfall([
    User.isExisting.bind(null, params.username),
    function (user, callback) {
      if (!user) return callback({ message: 'User not found' });
      User.deleteOne(
        { username: params.username },
        (err) => {
        if (err) return callback(err);
        callback();
      });
    }
  ], function (err) {
    if (err) return reply(notFound(err.message));
    reply({ success: true });
  });
}

function find(request, reply) {
  let {params, server} = request;
  const {User} = server.plugins['hapi-mongo-models'];

  Waterfall([
    User.isExisting.bind(null, params.username),
    function (user, callback) {
      if (!user) return callback({ message: 'User not found' });
      User.findOne(
        { username: params.username },
        (err, foundUser) => {
        if (err) return callback(err);
        callback(null, foundUser);
      });
    }
  ], function (err, foundUser) {
    if (err) return reply(notFound(err.message));
    delete foundUser.password;
    // delete foundUser.authToken; // TODO figure out if this should be returned
    reply(foundUser);
  });
}

function update(request, reply) {
  let user, {params, payload, server} = request;
  const {User} = server.plugins['hapi-mongo-models'];

  Waterfall([
    User.isExisting.bind(
      null,
      payload.email,
      params.username
    ),
    function (existingUser, callback) {
      if (!existingUser) {
        return callback({ message: 'User not found' });
      }
      user = existingUser;
      callback(null, existingUser);
    },
    function (existingUser, callback) {
      if (payload.password) {
        User.isPasswordMatch(
          payload.password,
          existingUser.password,
          (err, isMatch) => {
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
          payload.password,
          (err, hashedPassword) => {
          if (err) return callback(err);
          callback(null, hashedPassword);
        });
      } else {
        callback(null, false);
      }
    },
    function (hashedPassword, callback) {
      user.email = payload.email;
      user.location = payload.location;
      user.updated = Date.now();

      if (hashedPassword) user.password = hashedPassword;

      User.validate(user, (err, validatedUser) => {
        if (err) return callback(err);
        callback(null, validatedUser);
      });
    },
    function (validatedUser, callback) {
      User.updateOne(
        { username: params.username },
        validatedUser,
        (err) => {
        if (err) return callback(err);
        callback();
      });
    }
  ], function (err) {
    if (err) return reply(badRequest(err.message));
    reply(params.username);
  });
}

export default {
  create: create,
  find: find,
  remove: remove,
  update: update
};
