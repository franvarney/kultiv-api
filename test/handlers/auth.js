import {expect} from 'code';
import Lab from 'lab';
import {Server} from 'hapi';
import HapiAuthBearerToken from 'hapi-auth-bearer-token';
import Proxyquire from 'proxyquire';
import Sinon from 'sinon';

const lab = exports.lab = Lab.script();
const {describe, it, before, after, beforeEach, afterEach} = lab;

import Auth from '../../server/handlers/auth';
import Config from '../../config';
import UserModel from '../../server/models/user';

let server;

describe('handlers/auth', () => {
  before((done) => {
    let models, proxy, stub;

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

    server = new Server();

    server.connection({
      host: Config.env !== 'production' ? Config.host : null,
      port: parseInt(Config.port, 10)
    });

    server.register([HapiAuthBearerToken, models], (err) => {
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

  beforeEach((done) => {
    Sinon.stub(UserModel, 'findByToken').yields(new Error('find by token failed'));
    done();
  });

  afterEach((done) => {
    UserModel.findByToken.restore();
    done();
  });

  after((done) => {
    server.plugins['hapi-mongo-models'].BaseModel.disconnect();
    done();
  });

  describe('validate', () => {
    describe('when a token is found', () => {
      beforeEach((done) => {
        UserModel.findByToken.yields(null, true, { token: 'someToken' });
        done();
      });

      it('returns valid with the token', (done) => {
        let auth = Auth.validate.bind({ server });

        auth('someToken', (err, isValid, token) => {
          expect(err).to.be.null();
          expect(isValid).to.be.true();
          expect(token.token).to.equal('someToken');

          done();
        });
      });
    });

    describe('when a token is not found', () => {
      beforeEach((done) => {
        UserModel.findByToken.yields(null, false, { token: 'someToken' });
        done();
      });

      it('returns valid with the token', (done) => {
        let auth = Auth.validate.bind({ server });

        auth('someToken', (err, isValid, token) => {
          expect(err).to.be.null();
          expect(isValid).to.be.false();
          expect(token.token).to.equal('someToken');

          done();
        });
      });
    });

    describe('when finding a token fails', () => {
      it('returns valid with the token', (done) => {
        let auth = Auth.validate.bind({ server });

        auth('someToken', (err) => {
          expect(err.message).to.equal('find by token failed');
          done();
        });
      });
    });
  });
});
