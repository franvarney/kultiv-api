const Code = require('code')
const Lab = require('lab')
const Hapi = require('hapi')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach
const expect = Code.expect

const Config = require('../../config')
const User = require('../../server/handlers/user')
const UserModel = require('../../server/models/user')

var hashed, request, server, user

describe('handlers/user', function () {
  before(function (done) {
    var models, proxy, stub

    stub = {
      User: {}
    }

    proxy = {
      '../../server/models/user': stub.User
    }

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
    }

    server = new Hapi.Server()

    server.connection({
      host: Config.env !== 'production' ? Config.host : null,
      port: parseInt(Config.port, 10)
    })

    server.register([models], function (err) {
      if (err) return done(err)

      request = {
        payload: {
          email: 'test@test.com',
          username: 'test',
          password: 'Test'
        },
        params: {
          username: 'test'
        },
        server: {
          plugins: server.plugins
        },
        code: function () {}
      }

      server.initialize(done)
    })
  })

  beforeEach(function (done) {
    user = {
      email: 'test@test.com',
      username: 'test2',
      password: 'test'
    }

    hashed = '$2a$10$O9zAtP0M2SZpFxtcU9rHT.2kY.7BPBJGl8pHx0I8UOJGAjxC4Bh.K'

    Sinon.stub(UserModel, 'deleteOne').yields(new Error('delete one failed'))
    Sinon.stub(UserModel, 'findOne').yields(new Error('find one failed'))
    Sinon.stub(UserModel, 'hashPassword').yields(new Error('hash failed'))
    Sinon.stub(UserModel, 'insertOne').yields(new Error('insert failed'))
    Sinon.stub(UserModel, 'isExisting').yields(new Error('existing check failed'))
    Sinon.stub(UserModel, 'isPasswordMatch').yields(new Error('password compare failed'))
    Sinon.stub(UserModel, 'validate').yields(new Error('validate failed'))
    Sinon.stub(UserModel, 'updateOne').yields(new Error('update one failed'))

    done()
  })

  afterEach(function (done) {
    UserModel.deleteOne.restore()
    UserModel.findOne.restore()
    UserModel.hashPassword.restore()
    UserModel.insertOne.restore()
    UserModel.isExisting.restore()
    UserModel.isPasswordMatch.restore()
    UserModel.validate.restore()
    UserModel.updateOne.restore()

    done()
  })

  after(function (done) {
    server.plugins['hapi-mongo-models'].BaseModel.disconnect()
    done()
  })

  describe('create', function () {
    describe('when a user is created', function () {
      beforeEach(function (done) {
        UserModel.hashPassword.yields(null, hashed)
        UserModel.insertOne.yields(null, [user])
        UserModel.isExisting.yields(null, false)
        user.password = hashed
        UserModel.validate.yields(null, user)

        done()
      })
    })

    describe('when a user isn\'t created', function () {
      beforeEach(function (done) {
        UserModel.hashPassword.yields(null, hashed)
        UserModel.isExisting.yields(null, false)
        user.password = hashed
        UserModel.validate.yields(null, user)

        done()
      })

      it('returns an error', function (done) {
        User.create(request, function (err) {
          expect(err.message).to.equal('insert failed')
          done()
        })
      })
    })

    describe('when the user already exists', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        done()
      })

      it('returns an error', function (done) {
        User.create(request, function (err) {
          expect(UserModel.isExisting.called).to.be.true()
          expect(UserModel.insertOne.called).to.be.false()
          expect(err.message).to.equal('User already exists')

          done()
        })
      })
    })
  })

  describe('delete', function () {
    describe('when a user is deleted', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        UserModel.deleteOne.yields(null, 5)

        done()
      })

      it('returns a success message', function (done) {
        User.delete(request, function (message) {
          expect(UserModel.isExisting.called).to.be.true()
          expect(message.success).to.true()

          done()
        })
      })
    })

    describe('when delete fails', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        done()
      })

      it('returns an error', function (done) {
        User.delete(request, function (err) {
          expect(err.message).to.equal('delete one failed')
          done()
        })
      })
    })

    describe('when a user isn\'t found', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, false)
        done()
      })

      it('returns an error', function (done) {
        User.delete(request, function (err) {
          expect(err.message).to.equal('User not found')
          done()
        })
      })
    })
  })

  describe('find', function () {
    describe('when a user is found', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        UserModel.findOne.yields(null, user)

        done()
      })

      it('returns a success message', function (done) {
        User.find(request, function (found) {
          expect(UserModel.isExisting.called).to.be.true()
          expect(found).to.equal(user)

          done()
        })
      })
    })

    describe('when find fails', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        done()
      })

      it('returns an error', function (done) {
        User.find(request, function (err) {
          expect(err.message).to.equal('find one failed')
          done()
        })
      })
    })

    describe('when a user isn\'t found', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, false)
        done()
      })

      it('returns an error', function (done) {
        User.find(request, function (err) {
          expect(err.message).to.equal('User not found')
          done()
        })
      })
    })
  })

  describe('update', function () {
    describe('when a user is updated', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        UserModel.validate.yields(null, user)
        UserModel.updateOne.yields(null)

        done()
      })

      it('returns the updated user\'s username', function (done) {
        delete request.payload.password
        User.update(request, function (username) {
          expect(UserModel.isPasswordMatch.called).to.be.false()
          expect(UserModel.hashPassword.called).to.be.false()
          expect(username).to.equal('test')

          done()
        })
      })
    })

    describe('when the user isn\'t found', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, false)
        done()
      })

      it('returns an error', function (done) {
        User.update(request, function (err) {
          expect(err.message).to.equal('User not found')
          done()
        })
      })
    })

    describe('when a user isn\'t updated', function () {
      beforeEach(function (done) {
        UserModel.isExisting.yields(null, user)
        UserModel.validate.yields(null, user)

        done()
      })

      it('returns an error', function (done) {
        delete request.payload.password
        User.update(request, function (err) {
          expect(err.message).to.equal('update one failed')
          done()
        })
      })
    })
  })
})
