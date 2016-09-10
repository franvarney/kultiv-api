const {expect} = require('code')
const {Server} = require('hapi')
const HapiTreeize = require('hapi-treeize')
const Lab = require('lab')
const Sinon = require('sinon')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const Cookbook = require('../../server/handlers/cookbook')
const CookbookData = require('../fixtures/cookbooks')
const CookbookModel = require('../../server/models/cookbook')
const CookbookSchema = require('../../server/schemas/cookbook')
const Errors = require('../../server/utils/errors')
const UserData = require('../fixtures/users')
const UserModel = require('../../server/models/user')

const server = new Server()

describe('handlers/cookbook', () => {
  server.register(HapiTreeize, (err) => new Error(err))

  beforeEach((done) => {
    Sinon.stub(CookbookModel, 'set').returns(CookbookModel)
    return done()
  })

  afterEach((done) => {
    CookbookModel.set.restore()
    return done()
  })

  describe('allByUser', () => {
    let injected = {
      method: 'GET',
      url: '/users/3/cookbooks',
      credentials: { user: 3 }
    }

    before((done) => {
      server.connection()
      server.route({ method: 'GET', path: '/users/{id}/cookbooks', handler: Cookbook.allByUser })
      return done()
    })

    afterEach((done) => {
      CookbookModel.findByOwner.restore()
      UserModel.findById.restore()
      return done()
    })

    describe('gets user cookbooks', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findByOwner').yields(null, [CookbookData[0]])
        Sinon.stub(UserModel, 'findById').yields(null, UserData[1])
        return done()
      })

      it('yields array of cookbooks with status 200', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result).to.be.array()
          expect(typeof response.result[0].creator).to.equal('object')
          expect(CookbookModel.set.calledWith({ owner_id: '3' })).to.be.true()
          expect(CookbookModel.findByOwner.calledOnce).to.be.true()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('user has no cookbooks', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findByOwner').yields(null, [])
        Sinon.stub(UserModel, 'findById').yields(null, UserData[1])
        return done()
      })

      it('yields array of cookbooks with status 200', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result).to.be.array()
          expect(response.result.length).to.equal(0)
          expect(CookbookModel.set.calledWith({ owner_id: '3' })).to.be.true()
          expect(CookbookModel.findByOwner.calledOnce).to.be.true()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('user does not exist', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findByOwner')
        Sinon.stub(UserModel, 'findById').yields(['notFound', 'User Not Found'])
        return done()
      })

      it('yields an error with status 404', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(404)
          expect(response.result.error).to.equal('Not Found')
          expect(CookbookModel.set.calledWith({ owner_id: '3' })).to.be.false()
          expect(CookbookModel.findByOwner.calledOnce).to.be.false()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('get fails', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findByOwner').yields('error')
        Sinon.stub(UserModel, 'findById').yields(null, UserData[1])
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(CookbookModel.set.calledWith({ owner_id: '3' })).to.be.true()
          expect(CookbookModel.findByOwner.calledOnce).to.be.true()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('create', () => {
    let injected = {
      method: 'POST',
      url: '/cookbooks',
      payload: { name: 'Test 1' },
      credentials: { user: 3 }
    }

    before((done) => {
      server.connection()
      server.route({
        method: 'POST',
        path: '/cookbooks',
        config: {
          handler: Cookbook.create,
          validate: {
            payload: CookbookSchema.createPayload,
            failAction: Errors.validate,
            options: { stripUnknown: true }
          }
        }
      })
      return done()
    })

    afterEach((done) => {
      CookbookModel.create.restore()
      return done()
    })

    describe('creates a cookbook', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'create').yields(null, CookbookData[0].id)
        return done()
      })

      it('yields the id with status 201', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(201)
          expect(Object.keys(response.result)).to.equal(['id'])
          expect(typeof response.result.id).to.equal('number')
          expect(response.result.id).to.equal(1)
          expect(CookbookModel.set.calledWith({ name: 'Test 1', owner_id: 3 })).to.be.true()
          return done()
        })
      })
    })

    describe('bad data is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'create')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(Object.assign({}, injected, { payload: { name: 'No' } }), (response) => {
          expect(response.statusCode).to.equal(400)
          expect(CookbookModel.set.called).to.be.false()
          expect(CookbookModel.create.called).to.be.false()
          return done()
        })
      })
    })

    describe('create fails', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'create').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(CookbookModel.set.calledWith({ name: 'Test 1', owner_id: 3 })).to.be.true()
          expect(CookbookModel.create.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('delete', () => {
    let injected = {
      method: 'DELETE',
      url: `/cookbooks/1`,
      credentials: { user: 3 }
    }

    before((done) => {
      server.connection()
      server.route({ method: 'DELETE', path: '/cookbooks/{id}', handler: Cookbook.delete })
      return done()
    })

    afterEach((done) => {
      CookbookModel.deleteById.restore()
      CookbookModel.findById.restore()
      return done()
    })

    describe('deletes a cookbook', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'deleteById').yields(null, 1)
        Sinon.stub(CookbookModel, 'findById').yields(null, CookbookData[0])
        return done()
      })

      it('yields no content with status 204', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()
          expect(CookbookModel.findById.calledOnce).to.be.true()
          expect(CookbookModel.set.calledWith({ id: '1' })).to.be.true()
          expect(CookbookModel.deleteById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('cookbook does not exist', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'deleteById')
        Sinon.stub(CookbookModel, 'findById').yields(['notFound', 'Cookbook Not Found'])
        return done()
      })

      it('yields an error with status 404', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(404)
          expect(response.result.error).to.equal('Not Found')
          expect(CookbookModel.findById.calledOnce).to.be.true()
          expect(CookbookModel.set.calledWith({ id: '1' })).to.be.true()
          expect(CookbookModel.deleteById.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('delete fails', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findById').yields(null, CookbookData[0])
        Sinon.stub(CookbookModel, 'deleteById').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(CookbookModel.findById.calledOnce).to.be.true()
          expect(CookbookModel.set.calledWith({ id: '1' })).to.be.true()
          expect(CookbookModel.deleteById.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('get', () => {
    let injected = {
      method: 'GET',
      url: `/cookbooks/1`,
      credentials: { user: 3 }
    }

    before((done) => {
      server.connection()
      server.route({ method: 'GET', path: '/cookbooks/{id}', handler: Cookbook.get })
      return done()
    })

    afterEach((done) => {
      CookbookModel.findById.restore()
      return done()
    })

    describe('finds a cookbook', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findById').yields(null, CookbookData[0])
        return done()
      })

      it('yields the cookbook with status 200', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(typeof response.result.creator).to.equal('object')
          expect(response.result.name).to.equal('Test 1')
          expect(response.result.description).to.be.undefined()
          expect(CookbookModel.set.calledWith({ id: '1' })).to.be.true()
          expect(CookbookModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('does not find a cookbook', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findById').yields(['notFound', 'error'])
        return done()
      })

      it('yields an error with status 404', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(404)
          expect(response.result.message).to.equal('error')
          expect(CookbookModel.set.calledWith({ id: '1' })).to.be.true()
          expect(CookbookModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('get fails', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'findById').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(CookbookModel.set.calledWith({ id: '1' })).to.be.true()
          expect(CookbookModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('update', () => {
    let injected = {
      method: 'PUT',
      url: `/cookbooks/1`,
      payload: { description: 'Test description' },
      credentials: { user: 3 }
    }

    before((done) => {
      server.connection()
      server.route( {
        method: 'PUT',
        path: '/cookbooks/{id}',
        config: {
          handler: Cookbook.update,
          validate: {
            payload: CookbookSchema.updatePayload,
            failAction: Errors.validate,
            options: { stripUnknown: true }
          }
        }
      })
      return done()
    })

    afterEach((done) => {
      CookbookModel.update.restore()
      return done()
    })

    describe('updates a cookbook', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'update').yields(null, Object.assign(CookbookData[0], { description: 'Test description' }))
        return done()
      })

      it('yields no content with status 204', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()
          expect(CookbookModel.set.calledWith({
            id: '1',
            description: 'Test description'
          })).to.be.true()
          expect(CookbookModel.update.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('bad data is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'update')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(Object.assign({}, injected, { payload: { name: 'No' } }), (response) => {
          expect(response.statusCode).to.equal(400)
          expect(CookbookModel.set.called).to.be.false()
          expect(CookbookModel.update.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('update fails', () => {
      beforeEach((done) => {
        Sinon.stub(CookbookModel, 'update').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(CookbookModel.set.calledWith({
            id: '1',
            description: 'Test description'
          })).to.be.true()
          expect(CookbookModel.update.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })
})
