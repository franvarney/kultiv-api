const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')
const Sinon = require('sinon')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const Errors = require('../../server/utils/errors')
const User = require('../../server/handlers/user')
const UserData = require('../fixtures/users')
const UserModel = require('../../server/models/user')
const UserRoutes = require('../../server/routes/user')
const UserSchema = require('../../server/schemas/user')

const server = new Server()

describe('handlers/user', () => {
  before((done) => {
    server.connection()
    server.route(UserRoutes)
    return done()
  })

  beforeEach((done) => {
    Sinon.stub(UserModel, 'set').returns(UserModel)
    return done()
  })

  afterEach((done) => {
    UserModel.set.restore()
    return done()
  })

  describe('create', () => {
    let injected = {
      method: 'POST',
      url: '/users',
      payload: {
        username: 'username',
        password: 'Secret',
        email: 'test@example.com',
        first_name: 'First'
      }
    }

    afterEach((done) => {
      UserModel.create.restore()
      UserModel.findByEmailOrUsername.restore()
      return done()
    })

    describe('creates a user', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields()
        Sinon.stub(UserModel, 'create').yields(null, UserData[0].id)
        return done()
      })

      it('yields the id with status 201', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(201)
          expect(Object.keys(response.result)).to.equal(['id'])
          expect(typeof response.result.id).to.equal('number')
          expect(response.result.id).to.equal(2)
          expect(UserModel.set.calledWith({
            username: `username`,
            password: 'Secret',
            email: 'test@example.com',
            first_name: 'First'
          })).to.be.true()
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.create.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('bad data is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields()
        Sinon.stub(UserModel, 'create')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(Object.assign({}, injected, { payload: { username: null } }), (response) => {
          expect(response.statusCode).to.equal(400)
          expect(UserModel.set.called).to.be.false()
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.false()
          expect(UserModel.create.called).to.be.false()
          return done()
        })
      })
    })

    describe('existing email is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields(null, UserData[0])
        Sinon.stub(UserModel, 'create')
        return done()
      })

      it('yields an error with status 400', (done) => {
        let modifiedInjected = Object.assign({}, injected)
        modifiedInjected.payload = Object.assign({}, injected.payload, { email: 'test@gmail.com' })

        server.inject(modifiedInjected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('Invalid username/email')
          expect(UserModel.set.calledOnce).to.be.true()
          expect(UserModel.set.calledTwice).to.be.false()
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.create.called).to.be.false()
          return done()
        })
      })
    })

    describe('existing username is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields(null, UserData[0])
        Sinon.stub(UserModel, 'create')
        return done()
      })

      it('yields an error with status 400', (done) => {
        let modifiedInjected = Object.assign({}, injected)
        modifiedInjected.payload = Object.assign({}, injected.payload, { username: 'username' })

        server.inject(modifiedInjected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('Invalid username/email')
          expect(UserModel.set.calledOnce).to.be.true()
          expect(UserModel.set.calledTwice).to.be.false()
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.create.called).to.be.false()
          return done()
        })
      })
    })

    describe('existing email and username is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields(null, UserData[0])
        Sinon.stub(UserModel, 'create')
        return done()
      })

      it('yields an error with status 400', (done) => {
        let modifiedInjected = Object.assign({}, injected)
        modifiedInjected.payload = Object.assign({}, injected.payload, {
          email: 'test@gmail.com',
          username: 'username'
        })

        server.inject(modifiedInjected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('Invalid username/email')
          expect(UserModel.set.calledOnce).to.be.true()
          expect(UserModel.set.calledTwice).to.be.false()
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.create.called).to.be.false()
          return done()
        })
      })
    })

    describe('find fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields('error')
        Sinon.stub(UserModel, 'create')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.create.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('create fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields()
        Sinon.stub(UserModel, 'create').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.create.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('delete', () => {
    let injected = {
      method: 'DELETE',
      url: '/users/3',
      credentials: { user: 3 }
    }

    afterEach((done) => {
      UserModel.deleteById.restore()
      UserModel.findById.restore()
      return done()
    })

    describe('deletes a user', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'deleteById').yields(null, 1)
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        return done()
      })

      it('yields no content with status 204', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.set.calledWith({ id: '3' })).to.be.true()
          expect(UserModel.deleteById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('user does not exist', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'deleteById')
        Sinon.stub(UserModel, 'findById').yields(['notFound', 'User Not Found'])
        return done()
      })

      it('yields an error with status 404', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(404)
          expect(response.result.error).to.equal('Not Found')
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.set.calledWith({ id: '3' })).to.be.true()
          expect(UserModel.deleteById.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('delete fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        Sinon.stub(UserModel, 'deleteById').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.set.calledWith({ id: '3' })).to.be.true()
          expect(UserModel.deleteById.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('get', () => {
    let injected = {
      method: 'GET',
      url: '/users/2',
      credentials: { user: 2 }
    }

    afterEach((done) => {
      UserModel.findById.restore()
      return done()
    })

    describe('finds a user', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        return done()
      })

      it('yields the user with status 200', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.id).to.equal(2)
          expect(response.result.first_name).to.equal('First')
          expect(response.result.last_name).to.be.null()
          expect(UserModel.set.calledWith({ id: '2' })).to.be.true()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('does not find a user', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields(['notFound', 'User Not Found'])
        return done()
      })

      it('yields an error with status 404', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(404)
          expect(response.result.message).to.equal('User Not Found')
          expect(UserModel.set.calledWith({ id: '2' })).to.be.true()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('get fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.set.calledWith({ id: '2' })).to.be.true()
          expect(UserModel.findById.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })

  describe('update', () => {
    let injected = {
      method: 'PUT',
      url: '/users/2',
      payload: { first_name: 'Test' },
      credentials: { user: 2 }
    }

    afterEach((done) => {
      UserModel.findByEmailOrUsername.restore()
      UserModel.findById.restore()
      UserModel.update.restore()
      return done()
    })

    describe('updates a user', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields()
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        Sinon.stub(UserModel, 'update').yields(null, Object.assign(UserData[0], { first_name: 'Test' }))
        return done()
      })

      it('yields no content with status 204', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.set.thirdCall.calledWith({
            id: '2',
            first_name: 'Test'
          })).to.be.true()
          expect(UserModel.update.calledOnce).to.be.true()
          return done()
        })
      })
    })

    describe('user not found', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields()
        Sinon.stub(UserModel, 'findByEmailOrUsername')
        Sinon.stub(UserModel, 'update')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('User Not Found')
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.set.calledOnce).to.be.true()
          expect(UserModel.set.calledTwice).to.be.false()
          expect(UserModel.set.calledThrice).to.be.false()
          expect(UserModel.update.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('find fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields('error')
        Sinon.stub(UserModel, 'findByEmailOrUsername')
        Sinon.stub(UserModel, 'update')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.set.calledOnce).to.be.true()
          expect(UserModel.set.calledTwice).to.be.false()
          expect(UserModel.set.calledThrice).to.be.false()
          expect(UserModel.update.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('findByEmailOrUsername fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields('error')
        Sinon.stub(UserModel, 'update')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.findById.calledOnce).to.be.true()
          expect(UserModel.set.calledOnce).to.be.false()
          expect(UserModel.set.calledTwice).to.be.true()
          expect(UserModel.set.calledThrice).to.be.false()
          expect(UserModel.update.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('bad data is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername')
        Sinon.stub(UserModel, 'findById')
        Sinon.stub(UserModel, 'update')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(Object.assign({}, injected, { payload: { email: 'bad email' } }), (response) => {
          expect(response.statusCode).to.equal(400)
          expect(UserModel.set.calledOnce).to.be.false()
          expect(UserModel.set.calledTwice).to.be.false()
          expect(UserModel.update.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('existing email is submitted', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields(null, UserData[0])
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        Sinon.stub(UserModel, 'update')
        return done()
      })

      it('yields an error with status 400', (done) => {
        let modifiedInjected = Object.assign({}, injected)
        modifiedInjected.url = '/users/1'
        modifiedInjected.credentials.user = 1
        modifiedInjected.payload = { email: 'test2@gmail.com' }

        server.inject(modifiedInjected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('Invalid email')
          expect(UserModel.set.calledOnce).to.be.false()
          expect(UserModel.set.calledTwice).to.be.true()
          expect(UserModel.update.calledOnce).to.be.false()
          return done()
        })
      })
    })

    describe('update fails', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmailOrUsername').yields()
        Sinon.stub(UserModel, 'findById').yields(null, UserData[0])
        Sinon.stub(UserModel, 'update').yields('error')
        return done()
      })

      it('yields an error with status 400', (done) => {
        server.inject(injected, (response) => {
          expect(response.statusCode).to.equal(400)
          expect(response.result.message).to.equal('error')
          expect(UserModel.findByEmailOrUsername.calledOnce).to.be.true()
          expect(UserModel.update.calledOnce).to.be.true()
          return done()
        })
      })
    })
  })
})
