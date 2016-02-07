const Boom = require('boom');

const Recipe = require('../repositories/recipe');

exports.allByUser = function (request, reply) {
  var isLoaded = false;

  if (request.query && request.query.full) isLoaded = true;
  Recipe.findByUserId(request.params.id, isLoaded, (err, recipes) => {
    if (err) return reply(Boom.badRequest(err));
    reply(recipes).code(200);
  });
};

exports.create = function (request, reply) {
  Recipe.create(request.payload, (err, id) => {
    if (err) return reply(Boom.badRequest(err));
    return reply(id).code(201);
  });
};

exports.delete = function (request, reply) {
  Recipe.deleteById(request.payload.id, (err) => {
    if (err) return reply(Boom.badRequest(err));
    return reply().code(204);
  });
};

exports.get = function (request, reply) {
  Recipe.findById(request.payload.id, (err, recipe) => {
    if (err) return reply(Boom.badRequest(err));
    return reply(recipe).code(204);
  });
};

exports.update = function (request, reply) {
  //
};
