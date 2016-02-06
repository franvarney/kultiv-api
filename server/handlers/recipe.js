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
