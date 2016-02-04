const Boom = require('boom');
// const Debug = require('debug')('cookbook/src/controllers/user');
const Waterfall = require('run-waterfall');

const User = require('../repositories/user');

exports.create = function (request, reply) {
  User.create(request.payload, (err, exists, user) => {
    if (err) return reply(Boom.badRequest(err));
    if (exists) return reply(Boom.badRequest('User already exists'));
    return reply(user).code(201);
  });
};

exports.delete = function (request, reply) {
  User.deleteById(request.params.id, (err, user) => {
    if (err) return reply(Boom.badRequest(err));
    if (!user) return reply(Boom.notFound('User not found'));
    return reply().code(204);
  });
};

exports.get = function (request, reply) {
  User.findById(request.params.id, (err, user) => {
    if (err) return reply(Boom.badRequest(err));
    if (!user) return reply(Boom.notFound('User not found'));
    return reply(user).code(200);
  });
};

// exports.update = function (request, reply) {
//   var user;
//   const User = request.server.plugins['hapi-mongo-models'].User;

//   Waterfall([
//     User.isExisting.bind(
//       null,
//       request.payload.email,
//       request.params.username
//     ),
//     function (existingUser, callback) {
//       if (!existingUser) {
//         return callback({ message: 'User not found' });
//       }
//       user = existingUser;
//       callback(null, existingUser);
//     },
//     function (existingUser, callback) {
//       if (request.payload.password) {
//         User.isPasswordMatch(
//           request.payload.password,
//           existingUser.password,
//           function (err, isMatch) {
//             if (err) return callback(err);
//             callback(null, isMatch);
//           });
//       } else {
//         callback(null, true);
//       }
//     },
//     function (isMatch, callback) {
//       if (!isMatch) {
//         User.hashPassword(
//           request.payload.password,
//           function (err, hashedPassword) {
//           if (err) return callback(err);
//           callback(null, hashedPassword);
//         });
//       } else {
//         callback(null, false);
//       }
//     },
//     function (hashedPassword, callback) {
//       user.email = request.payload.email;
//       user.location = request.payload.location;
//       user.updated = Date.now();

//       if (hashedPassword) user.password = hashedPassword;

//       User.validate(user, function (err, validatedUser) {
//         if (err) return callback(err);
//         callback(null, validatedUser);
//       });
//     },
//     function (validatedUser, callback) {
//       User.updateOne(
//         { username: request.params.username },
//         validatedUser,
//         function (err) {
//         if (err) return callback(err);
//         callback();
//       });
//     }
//   ], function (err) {
//     if (err) return reply(Boom.badRequest(err.message));
//     reply(request.params.username);
//   });
// };
