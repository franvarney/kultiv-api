const Boom = require('boom')
const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')
const Sinon = require('sinon')

const lab = exports.lab = Lab.script()
const {after, before, beforeEach, describe, it} = lab

const Auth = require('../../server/handlers/auth')
const AuthModel = require('../../server/models/auth')
const UserModel = require('../../server/models/user')

const server = new Server()

describe('handlers/auth', () => {
  describe('getCredentialsFunc', () => {
    describe('when user exists', () => {
      it('should yield a credentials object', (done) => {
        Auth.getCredentialsFunc('b39e1e3d-8187-4087-a89f-e3886b67297a',
          (err, credentials) => {
            expect(err).to.be.null()
            expect(credentials.id).to.equal('b39e1e3d-8187-4087-a89f-e3886b67297a')
            expect(credentials.key).to.equal('43a12a1e-309f-4dd2-922f-102ba19b76e7')
            expect(credentials.user).to.equal(3)
            return done()
          })
      })
    })

    describe('when user does not exist', () => {
      it('should yield a credentials object', (done) => {
        Auth.getCredentialsFunc('2f6327fc-1751-4e16-b4d8-7aad9aac5ab4',
          (err, credentials) => {
            expect(err.message).to.equal('Key Not Found')
            return done()
          })
      })
    })
  })

  describe('login', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/auth', handler: Auth.login })
      return done()
    })

    describe('when user exists', () => {
      let user = new UserModel()

      before((done) => {
        Sinon.stub(user, 'findByEmailOrUsername').yields(null, {
          id: 3,
          username: 'samdoe',
          email: 'samdoe@gmail.com',
          password: '$2a$10$omDxHHXjobTTCyXZMTfPFuY9O/cvToUBS.zjisiGvaYzJoT1GR49C'
        })
        return done()
      })

      after((done) => {
        user.findByEmailOrUsername.restore()
        return done()
      })

      it('yields the user', (done) => {
        server.inject({
          method: 'POST',
          url: '/auth',
          payload: { login: 'samdoe', password: 'secret' }
        }, (response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.result.user_id).to.equal(3)
          return done()
        })
      })
    })

    describe('when user does not exist', () => {
      let user = new UserModel()

      before((done) => {
        Sinon.stub(user, 'findByEmailOrUsername').yields(null, undefined)
        return done()
      })

      after((done) => {
        user.findByEmailOrUsername.restore()
        return done()
      })

      it('yields the user', (done) => {
        server.inject({
          method: 'POST',
          url: '/auth',
          payload: { login: 'username', password: 'secret' }
        }, (response) => {
          expect(response.statusCode).to.equal(404)
          expect(response.result.message).to.equal('User Not Found')
          return done()
        })
      })
    })
  })
})
