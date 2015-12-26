import {expect} from 'code';
import Lab from 'lab';
import {Server} from 'hapi';
import Proxyquire from 'proxyquire';
import Sinon from 'sinon';

const lab = exports.lab = Lab.script();
const {describe, it, before, after, beforeEach, afterEach} = lab;

import Config from '../../config';
import Cookbook from '../../server/handlers/cookbook';
import CookbookModel from '../../server/models/cookbook';

let cookbook, cookbooks, request, server;

describe('handlers/cookbook', () => {
  before((done) => {
    let models, proxy, stub;

    stub = {
      Cookbook: {}
    };

    proxy = {
      '../../server/models/cookbook': stub.Cookbook
    };

    models = {
      register: Proxyquire('hapi-mongo-models', proxy),
      options: {
        mongodb: {
          url: Config.mongo.uri,
          options: {}
        },
        models: {
          Cookbook: process.cwd() + '/server/models/cookbook'
        }
      }
    };

    server = new Server();

    server.connection({
      host: Config.env !== 'production' ? Config.host : null,
      port: parseInt(Config.port, 10)
    });

    server.register([models], (err) => {
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
        code: () => {}
      };

      server.initialize(done);
    });
  });

  beforeEach((done) => {
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

  afterEach((done) => {
    CookbookModel.deleteOne.restore();
    CookbookModel.find.restore();
    CookbookModel.findOne.restore();
    CookbookModel.insertOne.restore();
    CookbookModel.updateOne.restore();
    CookbookModel.validate.restore();

    done();
  });

  after((done) => {
    server.plugins['hapi-mongo-models'].BaseModel.disconnect();
    done();
  });

  describe('allByUser', () => {
    describe('when there are cookbooks', () => {
      beforeEach((done) => {
        CookbookModel.find.yields(null, cookbooks);
        done();
      });

      it('returns the cookbooks', (done) => {
        Cookbook.allByUser(request, (foundCookbooks) => {
          expect(foundCookbooks.length).to.equal(2);
          expect(foundCookbooks).to.equal(cookbooks);

          done();
        });
      });
    });

    describe('when there are no cookbooks', () => {
      beforeEach((done) => {
        CookbookModel.find.yields(null, []);
        done();
      });

      it('returns an error', (done) => {
        Cookbook.allByUser(request, (foundCookbooks) => {
          expect(foundCookbooks.length).to.be.undefined();
          done();
        });
      });
    });

    describe('when finding cookbooks fails', () => {
      it('returns an error', (done) => {
        Cookbook.allByUser(request, (err) => {
          expect(err.message).to.equal('find failed');
          done();
        });
      });
    });
  });

  describe('create', () => {
    describe('when a cookbook is created', () => {
      beforeEach((done) => {
        CookbookModel.validate.yields(null, cookbook);
        CookbookModel.insertOne.yields(null, cookbook);

        done();
      });

      it('returns the cookbook id', (done) => {
        Cookbook.create(request, (cookbookId) => {
          expect(cookbookId).to.equal('abc23');
          done();
        });
      });
    });

    describe('when validating a new cookbook fails', () => {
      it('returns an error', (done) => {
        Cookbook.create(request, (err) => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('validate failed');

          done();
        });
      });
    });

    describe('when saving a new cookbook fails', () => {
      beforeEach((done) => {
        CookbookModel.validate.yields(null, cookbook);
        done();
      });

      it('returns an error', (done) => {
        Cookbook.create(request, (err) => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('insert one failed');

          done();
        });
      });
    });
  });

  describe('delete', () => {
    describe('when a cookbook is deleted', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null, cookbook);
        CookbookModel.deleteOne.yields(null, 1);

        done();
      });

      it('returns a success message', (done) => {
        Cookbook.remove(request, (result) => {
          expect(result.message).to.equal('success');
          done();
        });
      });
    });

    describe('when finding a cookbook to delete fails', () => {
      it('returns an error', (done) => {
        Cookbook.remove(request, (err) => {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });

    describe('when finding a cookbook to delete returns nothing', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null);
        done();
      });

      it('returns an error', (done) => {
        Cookbook.remove(request, (err) => {
          expect(err.message).to.equal('Cookbook Not Found');
          done();
        });
      });
    });

    describe('when delete fails', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null, cookbook);
        done();
      });

      it('returns an error', (done) => {
        Cookbook.remove(request, (err) => {
          expect(err.message).to.equal('delete one failed');
          done();
        });
      });
    });
  });

  describe('find', () => {
    describe('when a cookbook is found', () => {
      beforeEach((done) => {
        cookbook.password = 'test';
        CookbookModel.findOne.yields(null, cookbook);

        done();
      });

      it('returns a cookbook', (done) => {
        Cookbook.find(request, (foundCookbook) => {
          expect(foundCookbook).to.equal(cookbook);
          expect(foundCookbook.password).to.be.undefined();

          done();
        });
      });
    });

    describe('when a cookbook is not found', () => {
      it('returns an error', (done) => {
        Cookbook.find(request, (err) => {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });
  });

  describe('update', () => {
    describe('when the cookbook is updated', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null, cookbook);
        CookbookModel.validate.yields(null, cookbook);
        CookbookModel.updateOne.yields(null, 1);

        done();
      });

      it('returns the cookbook id', (done) => {
        Cookbook.update(request, (cookbookId) => {
          expect(cookbookId).to.equal('abc23');
          done();
        });
      });
    });

    describe('when finding the cookbook fails', () => {
      it('returns an error', (done) => {
        Cookbook.update(request, (err) => {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });

    describe('when no cookbook is found', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null, null);
        done();
      });

      it('returns an error', (done) => {
        Cookbook.update(request, (err) => {
          expect(err.message).to.equal('Cookbook Not Found');
          done();
        });
      });
    });

    describe('when validating the cookbook fails', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null, cookbook);
        done();
      });

      it('returns an error', (done) => {
        Cookbook.update(request, (err) => {
          expect(err.message).to.equal('validate failed');
          done();
        });
      });
    });

    describe('when updating the cookbook fails', () => {
      beforeEach((done) => {
        CookbookModel.findOne.yields(null, cookbook);
        CookbookModel.validate.yields(null, cookbook);

        done();
      });

      it('returns an error', (done) => {
        Cookbook.update(request, (err) => {
          expect(err.message).to.equal('update one failed');
          done();
        });
      });
    });
  });
});
