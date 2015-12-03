const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');
const Proxyquire = require('proxyquire');
const Sinon = require('sinon');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

const Config = require('../../config');
const Cookbook = require('../../src/controllers/cookbook');
const CookbookModel = require('../../src/models/cookbook');

var cookbook, cookbooks, request, server;

describe('controllers/cookbook', function () {
  before(function (done) {
    var models, proxy, stub;

    stub = {
      Cookbook: {}
    };

    proxy = {
      '../../../src/models/cookbook': stub.Cookbook
    };

    models = {
      register: Proxyquire('hapi-mongo-models', proxy),
      options: {
        mongodb: {
          url: Config.mongo.uri,
          options: {}
        },
        models: {
          Cookbook: process.cwd() + '/src/models/cookbook'
        }
      }
    };

    server = new Hapi.Server();

    server.connection({
      host: Config.host,
      port: Number(Config.port)
    });

    server.register([models], function (err) {
      if (err) return done(err);

      request = {
        auth: {
          credentials: {
            user: {
              id: 'abc23'
            }
          }
        },
        payload: {
          //
        },
        params: {
          id: 'abc23',
          username: 'test'
        },
        server: {
          plugins: server.plugins
        },
        code: function () {}
      };

      server.initialize(done);
    });
  });

  beforeEach(function (done) {
    cookbook = {
      _id: 'abc23',
      title: 'Test Book',
      description: '',
      userId: '1223',
      isPrivate: true,
      recipeIds: [],
      contributorIds: []
    };

    cookbooks = [
      cookbook, cookbook
    ];

    Sinon.stub(CookbookModel, 'deleteOne').yields(new Error('delete one failed'));
    Sinon.stub(CookbookModel, 'find').yields(new Error('find failed'));
    Sinon.stub(CookbookModel, 'findOne').yields(new Error('find one failed'));
    Sinon.stub(CookbookModel, 'insertOne').yields(new Error('insert one failed'));
    Sinon.stub(CookbookModel, 'updateOne').yields(new Error('update one failed'));
    Sinon.stub(CookbookModel, 'validate').yields(new Error('validate failed'));

    done();
  });

  afterEach(function (done) {
    CookbookModel.deleteOne.restore();
    CookbookModel.find.restore();
    CookbookModel.findOne.restore();
    CookbookModel.insertOne.restore();
    CookbookModel.updateOne.restore();
    CookbookModel.validate.restore();

    done();
  });

  after(function (done) {
    server.plugins['hapi-mongo-models'].BaseModel.disconnect();
    done();
  });

  describe('allByUser', function () {
    describe('when there are cookbooks', function () {
      beforeEach(function (done) {
        CookbookModel.find.yields(null, cookbooks);
        done();
      });

      it('returns the cookbooks', function (done) {
        Cookbook.allByUser(request, function (foundCookbooks) {
          expect(foundCookbooks.length).to.equal(2);
          expect(foundCookbooks).to.equal(cookbooks);

          done();
        });
      });
    });

    describe('when there are no cookbooks', function () {
      beforeEach(function (done) {
        CookbookModel.find.yields(null, []);
        done();
      });

      it('returns an error', function (done) {
        Cookbook.allByUser(request, function (foundCookbooks) {
          expect(foundCookbooks.length).to.be.undefined();
          done();
        });
      });
    });

    describe('when finding cookbooks fails', function () {
      it('returns an error', function (done) {
        Cookbook.allByUser(request, function (err) {
          expect(err.message).to.equal('find failed');
          done();
        });
      });
    });
  });

  describe('create', function () {
    describe('when a cookbook is created', function () {
      beforeEach(function (done) {
        CookbookModel.validate.yields(null, cookbook);
        CookbookModel.insertOne.yields(null, cookbook);

        done();
      });

      it('returns the cookbook id', function (done) {
        Cookbook.create(request, function (cookbookId) {
          expect(cookbookId).to.equal('abc23');
          done();
        });
      });
    });

    describe('when validating a new cookbook fails', function () {
      it('returns an error', function (done) {
        Cookbook.create(request, function (err) {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('validate failed');

          done();
        });
      });
    });

    describe('when saving a new cookbook fails', function () {
      beforeEach(function (done) {
        CookbookModel.validate.yields(null, cookbook);
        done();
      });

      it('returns an error', function (done) {
        Cookbook.create(request, function (err) {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('insert one failed');

          done();
        });
      });
    });
  });

  describe('delete', function () {
    describe('when a cookbook is deleted', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null, cookbook);
        CookbookModel.deleteOne.yields(null, 1);

        done();
      });

      it('returns a success message', function (done) {
        Cookbook.delete(request, function (result) {
          expect(result.message).to.equal('success');
          done();
        });
      });
    });

    describe('when finding a cookbook to delete fails', function () {
      it('returns an error', function (done) {
        Cookbook.delete(request, function (err) {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });

    describe('when finding a cookbook to delete returns nothing', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null);
        done();
      });

      it('returns an error', function (done) {
        Cookbook.delete(request, function (err) {
          expect(err.message).to.equal('Cookbook Not Found');
          done();
        });
      });
    });

    describe('when delete fails', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null, cookbook);
        done();
      });

      it('returns an error', function (done) {
        Cookbook.delete(request, function (err) {
          expect(err.message).to.equal('delete one failed');
          done();
        });
      });
    });
  });

  describe('find', function () {
    describe('when a cookbook is found', function () {
      beforeEach(function (done) {
        cookbook.password = 'test';
        CookbookModel.findOne.yields(null, cookbook);

        done();
      });

      it('returns a cookbook', function (done) {
        Cookbook.find(request, function (foundCookbook) {
          expect(foundCookbook).to.equal(cookbook);
          expect(foundCookbook.password).to.be.undefined();

          done();
        });
      });
    });

    describe('when a cookbook is not found', function () {
      it('returns an error', function (done) {
        Cookbook.find(request, function (err) {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });
  });

  describe('update', function () {
    describe('when the cookbook is updated', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null, cookbook);
        CookbookModel.validate.yields(null, cookbook);
        CookbookModel.updateOne.yields(null, 1);

        done();
      });

      it('returns the cookbook id', function (done) {
        Cookbook.update(request, function (cookbookId) {
          expect(cookbookId).to.equal('abc23');
          done();
        });
      });
    });

    describe('when finding the cookbook fails', function () {
      it('returns an error', function (done) {
        Cookbook.update(request, function (err) {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });

    describe('when no cookbook is found', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null, null);
        done();
      });

      it('returns an error', function (done) {
        Cookbook.update(request, function (err) {
          expect(err.message).to.equal('Cookbook Not Found');
          done();
        });
      });
    });

    describe('when validating the cookbook fails', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null, cookbook);
        done();
      });

      it('returns an error', function (done) {
        Cookbook.update(request, function (err) {
          expect(err.message).to.equal('validate failed');
          done();
        });
      });
    });

    describe('when updating the cookbook fails', function () {
      beforeEach(function (done) {
        CookbookModel.findOne.yields(null, cookbook);
        CookbookModel.validate.yields(null, cookbook);

        done();
      });

      it('returns an error', function (done) {
        Cookbook.update(request, function (err) {
          expect(err.message).to.equal('update one failed');
          done();
        });
      });
    });
  });
});
