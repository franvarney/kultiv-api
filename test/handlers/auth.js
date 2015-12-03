const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');
const HapiAuthBearerToken = require('hapi-auth-bearer-token');
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

const Auth = require('../../server/handlers/auth');
const Config = require('../../config');
const UserModel = require('../../server/models/user');

var server;

describe('handlers/auth', function () {
  before(function (done) {
    var models, proxy, stub;

    stub = {
      User: {}
    };

    proxy = {
      '../../server/models/user': stub.User
    };

    models = {
      register: Proxyquire('hapi-mongo-models', proxy),
      options: {
        mongodb: {
          url: Config.mongo.uri,
          options: {}
        },
        models: {
          User: process.cwd() + '/server/models/user'
        }
      }
    };

    server = new Hapi.Server();

    server.connection({
      host: Config.env !== 'production' ? Config.host : null,
      port: parseInt(Config.port, 10)
    });

    server.register([HapiAuthBearerToken, models], function (err) {
      if (err) return done(err);

      server.auth.strategy('simple', 'bearer-access-token', {
        allowQueryToken: true,
        allowMultipleHeaders: false,
        accessTokenName: 'auth_token',
        validateFunc: Auth.validate.bind(server)
      });

      server.auth.default({
        strategy: 'simple'
      });

      server.initialize(done);
    });
  });

  beforeEach(function (done) {
    Sinon.stub(UserModel, 'findByToken').yields(new Error('find by token failed'));
    done();
  });

  afterEach(function (done) {
    UserModel.findByToken.restore();
    done();
  });

  after(function (done) {
    server.plugins['hapi-mongo-models'].BaseModel.disconnect();
    done();
  });

  describe('validate', function () {
    describe('when a token is found', function () {
      beforeEach(function (done) {
        UserModel.findByToken.yields(null, true, { token: 'someToken' });
        done();
      });

      it('returns valid with the token', function (done) {
        var auth = Auth.validate.bind({ server });

        auth('someToken', function (err, isValid, token) {
          expect(err).to.be.null();
          expect(isValid).to.be.true();
          expect(token.token).to.equal('someToken');

          done();
        });
      });
    });

    describe('when a token is not found', function () {
      beforeEach(function (done) {
        UserModel.findByToken.yields(null, false, { token: 'someToken' });
        done();
      });

      it('returns valid with the token', function (done) {
        var auth = Auth.validate.bind({ server });

        auth('someToken', function (err, isValid, token) {
          expect(err).to.be.null();
          expect(isValid).to.be.false();
          expect(token.token).to.equal('someToken');

          done();
        });
      });
    });

    describe('when finding a token fails', function () {
      it('returns valid with the token', function (done) {
        var auth = Auth.validate.bind({ server });

        auth('someToken', function (err) {
          expect(err.message).to.equal('find by token failed');
          done();
        });
      });
    });
  });
});
