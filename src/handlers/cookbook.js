const Boom = require('boom');
// const Debug = require('debug')('cookbook/src/controllers/cookbook');
const Waterfall = require('run-waterfall');

exports.allByUser = function (request, reply) {
  const Cookbook = request.server.plugins['hapi-mongo-models'].Cookbook;

  Cookbook.find(
    { userId: request.params.username },
    function (err, cookbooks) {
      if (err) return reply(Boom.badRequest(err.message));
      if (cookbooks.length < 1) return reply(Boom.notFound('No Cookbooks Found'));

      reply(cookbooks);
    });
};

exports.create = function (request, reply) {
  var cookbook;
  const Cookbook = request.server.plugins['hapi-mongo-models'].Cookbook;

  cookbook = {
    title: request.payload.title,
    description: request.payload.description || '',
    userId: request.auth.credentials.user.id,
    isPrivate: request.payload.private || false,
    recipeIds: [],
    contributorIds: []
  };
  // TODO password:, worry about this later

  Waterfall([
    function (callback) {
      Cookbook.validate(cookbook, callback);
    },
    function (validatedCookbook, callback) {
      Cookbook.insertOne(validatedCookbook, callback);
    }
  ], function (err, newCookbook) {
    if (err) return reply(Boom.badRequest(err.message));
    reply(newCookbook._id); // eslint-disable-line
  });
};

exports.delete = function (request, reply) {
  const Cookbook = request.server.plugins['hapi-mongo-models'].Cookbook;

  Waterfall([
    function (callback) {
      Cookbook.findOne(
        { _id: request.params.id },
        function (err, foundCookbook) {
          if (err) return callback(err);
          if (!foundCookbook) return callback(null, false);
          callback(null, foundCookbook);
        });
    },
    function (foundCookbook, callback) {
      if (!foundCookbook) {
        callback(null, foundCookbook);
      } else {
        Cookbook.deleteOne({ _id: request.params.id }, function (err) {
          if (err) return callback(err);
          callback(null, foundCookbook);
        });
      }
    }
  ], function (err, foundCookbook) {
    if (err) return reply(Boom.badRequest(err.message));
    if (!foundCookbook) return reply(Boom.notFound('Cookbook Not Found'));

    reply({ message: 'success' });
  });
};

exports.find = function (request, reply) {
  const Cookbook = request.server.plugins['hapi-mongo-models'].Cookbook;

  Cookbook.findOne(
    { _id: request.params.id },
    function (err, foundCookbook) {
    if (err) return reply(Boom.badRequest(err.message));
    if (!foundCookbook) return reply(Boom.notFound('Cookbook Not Found'));

    if (foundCookbook.password) delete foundCookbook.password;
    reply(foundCookbook);
  });
};

exports.update = function (request, reply) {
  const Cookbook = request.server.plugins['hapi-mongo-models'].Cookbook;

  Waterfall([
    function (callback) {
      Cookbook.findOne(
        { _id: request.params.id },
        function (err, foundCookbook) {
          if (err) return callback(err);
          if (!foundCookbook) return callback(null, false);

          callback(null, foundCookbook);
        });
    },
    function (foundCookbook, callback) {
      if (!foundCookbook) {
        callback(null, false);
      } else {
        foundCookbook.title = request.payload.title || foundCookbook.title;
        foundCookbook.description = request.payload.description || foundCookbook.description;
        foundCookbook.isPrivate = request.payload.private || foundCookbook.isPrivate;
        foundCookbook.updated = Date.now();
        // TODO add password

        Cookbook.validate(foundCookbook, function (err, validatedCookbook) {
          if (err) return callback(err);
          callback(null, validatedCookbook);
        });
      }
    },
    function (validatedCookbook, callback) {
      if (!validatedCookbook) {
        callback(null, false)
      } else {
        Cookbook.updateOne({ _id: request.params.id }, validatedCookbook, callback);
      }
    }
  ], function (err, cookbook) {
    if (err) return reply(Boom.badRequest(err.message));
    if (!cookbook) return reply(Boom.notFound('Cookbook Not Found'));

    reply(request.params.id);
  });
};
