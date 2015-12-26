import {badRequest, notFound} from 'boom';
import Waterfall from 'run-waterfall';

function allByUser(request, reply) {
  const Cookbook = request.server.plugins['hapi-mongo-models'].Cookbook;

  Cookbook.find(
    { userId: request.params.username },
    (err, cookbooks) => {
      if (err) return reply(badRequest(err.message));
      if (cookbooks.length < 1) return reply(notFound('No Cookbooks Found'));

      reply(cookbooks);
    });
};

function create(request, reply) {
  let cookbook, {auth, payload, server} = request;
  const {Cookbook} = server.plugins['hapi-mongo-models'];

  cookbook = {
    title: payload.title,
    description: payload.description || '',
    userId: auth.credentials.user.id,
    isPrivate: payload.private || false,
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
    if (err) return reply(badRequest(err.message));
    reply(newCookbook._id); // eslint-disable-line
  });
}

function remove(request, reply) {
  let {params, server} = request;
  const {Cookbook} = server.plugins['hapi-mongo-models'];

  Waterfall([
    function (callback) {
      Cookbook.findOne(
       { _id: params.id },
       (err, foundCookbook) => {
          if (err) return callback(err);
          if (!foundCookbook) return callback(null, false);
          callback(null, foundCookbook);
        });
    },
    function (foundCookbook, callback) {
      if (!foundCookbook) {
        callback(null, foundCookbook);
      } else {
        Cookbook.deleteOne({ _id: params.id }, (err) => {
          if (err) return callback(err);
          callback(null, foundCookbook);
        });
      }
    }
  ], function (err, foundCookbook) {
    if (err) return reply(badRequest(err.message));
    if (!foundCookbook) return reply(notFound('Cookbook Not Found'));

    reply({ message: 'success' });
  });
}

function find(request, reply) {
  let {params, server} = request;
  const {Cookbook} = server.plugins['hapi-mongo-models'];

  Cookbook.findOne(
    { _id: params.id },
    (err, foundCookbook) => {
    if (err) return reply(badRequest(err.message));
    if (!foundCookbook) return reply(notFound('Cookbook Not Found'));

    if (foundCookbook.password) delete foundCookbook.password;
    reply(foundCookbook);
  });
};

function update(request, reply) {
  let {params, payload, server} = request;
  const {Cookbook} = server.plugins['hapi-mongo-models'];

  Waterfall([
    function (callback) {
      Cookbook.findOne(
        { _id: params.id },
        (err, foundCookbook) => {
          if (err) return callback(err);
          if (!foundCookbook) return callback(null, false);

          callback(null, foundCookbook);
        });
    },
    function (foundCookbook, callback) {
      if (!foundCookbook) {
        callback(null, false);
      } else {
        foundCookbook.title = payload.title || foundCookbook.title;
        foundCookbook.description = payload.description || foundCookbook.description;
        foundCookbook.isPrivate = payload.private || foundCookbook.isPrivate;
        foundCookbook.updated = Date.now();
        // TODO add password

        Cookbook.validate(foundCookbook, (err, validatedCookbook) => {
          if (err) return callback(err);
          callback(null, validatedCookbook);
        });
      }
    },
    function (validatedCookbook, callback) {
      if (!validatedCookbook) {
        callback(null, false)
      } else {
        Cookbook.updateOne({ _id: params.id }, validatedCookbook, callback);
      }
    }
  ], function (err, cookbook) {
    if (err) return reply(badRequest(err.message));
    if (!cookbook) return reply(notFound('Cookbook Not Found'));

    reply(params.id);
  });
};

export default {
  allByUser: allByUser,
  create: create,
  find: find,
  remove: remove,
  update: update
};
