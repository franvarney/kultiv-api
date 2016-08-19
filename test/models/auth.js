const Bcrypt = require('bcryptjs')
const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')
const Uuid = require('uuid4')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const Auth = require('../../server/models/auth')
const DB = require('../../server/connections/postgres')

// TODO make user model function a util to use here?
function hashPassword(password) {
  const salt = Bcrypt.genSaltSync(10)
  return Bcrypt.hashSync(password, salt)
}

describe('models/auth', () => {
  let tracker = MockKnex.getTracker()

  before((done) => {
    MockKnex.mock(DB)
    return done()
  })

  beforeEach((done) => {
    tracker.install()
    return done()
  })

  after((done) => {
    MockKnex.unmock(DB)
    return done()
  })

  afterEach((done) => {
    tracker.uninstall()
    return done()
  })

  describe('create aka login', () => {
    describe('when successfully logs in with username', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                username: 'username2',
                email: 'test@gmail.com',
                password: hashPassword('secret'),
                first_name: null,
                last_name: null,
                location: null,
                is_admin: false,
                created_at: Date.now(),
                updated_at: Date.now()
              })
            },
            function () {
              return query.response(1);
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields a login', (done) => {
        Auth
          .set({ login: 'username', password: 'secret' })
          .create((err, auth) => {
            expect(err).to.be.null()
            expect(auth.user_id).to.equal(1)
            expect(auth.hawk_id.length).to.equal(36)
            expect(auth.hawk_key.length).to.equal(36)
            return done()
          })
      })
    })

    describe('when successfully logs in with email', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                username: 'username2',
                email: 'test@gmail.com',
                password: hashPassword('secret'),
                first_name: null,
                last_name: null,
                location: null,
                is_admin: false,
                created_at: Date.now(),
                updated_at: Date.now()
              })
            },
            function () {
              return query.response(1);
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields a login', (done) => {
        Auth
          .set({ login: 'test@gmail.com', password: 'secret' })
          .create((err, auth) => {
            expect(err).to.be.null()
            expect(auth.user_id).to.equal(1)
            expect(auth.hawk_id.length).to.equal(36)
            expect(auth.hawk_key.length).to.equal(36)
            return done()
          })
      })
    })

    describe('when user is not found', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response()
            },
            function () {
              return query.response();
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ login: 'test@gmail.com', password: 'secret' })
          .create((err, auth) => {
            expect(err).to.be.equal(['notFound', 'User Not Found'])
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })

    describe('when password is not correct', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                username: 'username',
                email: 'test@gmail.com',
                password: hashPassword('password'),
                first_name: null,
                last_name: null,
                location: null,
                is_admin: false,
                created_at: Date.now(),
                updated_at: Date.now()
              })
            },
            function () {
              return query.response();
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ login: 'test@gmail.com', password: 'secret' })
          .create((err, auth) => {
            expect(err).to.be.equal(['unauthorized', 'Invalid Password'])
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.reject()
            },
            function () {
              return query.response();
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ login: 'test@gmail.com', password: 'secret' })
          .create((err, auth) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })

    describe('when second query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                username: 'username2',
                email: 'test@gmail.com',
                password: hashPassword('secret'),
                first_name: null,
                last_name: null,
                location: null,
                is_admin: false,
                created_at: Date.now(),
                updated_at: Date.now()
              })
            },
            function () {
              return query.reject();
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ login: 'test@gmail.com', password: 'secret' })
          .create((err, auth) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('deleteById aka logout', () => {
    describe('when successfully logs out', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response(1)
        })
        return done()
      })

      it('yields nothing', (done) => {
        Auth
          .set({ id: Uuid() })
          .deleteById((err) => {
            expect(err).to.be.undefined()
            return done()
          })
      })
    })

    describe('when unsuccessfully logs out', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response(0)
        })
        return done()
      })

      it('yields nothing', (done) => {
        Auth
          .set({ id: Uuid() })
          .deleteById((err) => {
            expect(err).to.be.undefined()
            return done()
          })
      })
    })

    describe('when query fails', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.reject('error')
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ id: Uuid() })
          .deleteById((err, auth) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('findById', () => {
    describe('when successfully finds by id', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response({
            id: Uuid(),
            key: Uuid(),
            user: 1
          })
        })
        return done()
      })

      it('yields nothing', (done) => {
        Auth
          .set({ id: Uuid() })
          .findById((err, auth) => {
            expect(err).to.be.null()
            expect(auth.user).to.equal(1)
            expect(auth.id.length).to.equal(36)
            expect(auth.key.length).to.equal(36)
            return done()
          })
      })
    })

    describe('when fails to find by id', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response()
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ id: Uuid() })
          .findById((err, auth) => {
            expect(err).to.equal(['notFound', 'Key Not Found'])
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })

    describe('when query fails', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.reject('error')
        })
        return done()
      })

      it('yields an error', (done) => {
        Auth
          .set({ id: Uuid() })
          .findById((err, auth) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(auth).to.be.undefined()
            return done()
          })
      })
    })
  })
})
