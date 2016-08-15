const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, describe, it} = lab

const DB = require('../../server/connections/postgres')
const User = require('../../server/models/user')

describe('models/user', () => {
  let tracker = MockKnex.getTracker()

  before((done) => {
    MockKnex.mock(DB)
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

  describe('create', () => {
    describe('when successfully creates a user', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({})
            },
            function () {
              return query.response({});
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the id', (done) => {
        User
          .set({ email: 'test2@gmail.com', username: 'username2', password: 'secret' })
          .create((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })
  })

  describe('deleteById', () => {
    describe('when successfully deletes a user', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                username: 'username',
                email: 'test@gmail.com',
                password: 'secret',
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

      it('should yield the the deleted count', (done) => {
        User
          .set({ id: 1 })
          .deleteById((err, count) => {
            expect(err).to.be.null()
            expect(count).to.equal(1)
            return done()
          })
      })
    })
  })

  describe('findByEmailOrUsername', () => {
    describe('when successfully finds a user by username', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query) {
          return query.response({
            id: 1,
            username: 'username',
            email: 'test@gmail.com',
            password: 'secret',
            first_name: null,
            last_name: null,
            location: null,
            is_admin: false,
            created_at: Date.now(),
            updated_at: Date.now()
          })
        })
        return done()
      })

      it('should yield the user', (done) => {
        User
          .set({ username: 'username' })
          .findByEmailOrUsername((err, user) => {
            expect(err).to.be.null()
            expect(user.username).to.equal('username')
            return done()
          })
      })
    })

    describe('when successfully finds a user by email', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query) {
          return query.response({
            id: 1,
            username: 'username',
            email: 'test@gmail.com',
            password: 'secret',
            first_name: null,
            last_name: null,
            location: null,
            is_admin: false,
            created_at: Date.now(),
            updated_at: Date.now()
          })
        })
        return done()
      })

      it('should yield the user', (done) => {
        User
          .set({ email: 'test@gmail.com' })
          .findByEmailOrUsername((err, user) => {
            expect(err).to.be.null()
            expect(user.email).to.equal('test@gmail.com')
            return done()
          })
      })
    })
  })

  describe('findById', () => {
    describe('when successful and there is an user', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query) {
          return query.response({
            id: 1,
            username: 'username',
            email: 'test@gmail.com',
            password: 'secret',
            first_name: null,
            last_name: null,
            location: null,
            is_admin: false,
            created_at: Date.now(),
            updated_at: Date.now()
          })
        })
        return done()
      })

      it('should yield a user', (done) => {
        User
          .set({ id: 1 })
          .findById((err, user) => {
            expect(err).to.be.null()
            expect(user.id).to.be.equal(1)
            return done()
          })
      })
    })

    describe('when user does not exist', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query) {
          return query.response(undefined)
        })
        return done()
      })

      it('should yield an error', (done) => {
        User
          .set({ id: 2 })
          .findById((err) => {
            expect(err).to.not.be.null()
            expect(err).to.equal([ 'notFound', 'Not Found' ])
            return done()
          })
      })
    })
  })

  describe('update', () => {
    describe('when successful', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                username: 'username',
                email: 'test@gmail.com',
                password: 'secret',
                first_name: null,
                last_name: null,
                location: null,
                is_admin: false,
                created_at: Date.now(),
                updated_at: Date.now()
              })
            },
            function () {
              return query.response([1]);
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the id', (done) => {
        User
          .set({ id: 1, first_name: 'John' })
          .update((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })

    describe('when user not found', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([2]);
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield an error', (done) => {
        User
          .set({ id: 1, first_name: 'Jane' })
          .update((err) => {
            expect(err).to.not.be.null()
            expect(err).to.equal([ 'notFound', 'Not Found' ])
            return done()
          })
      })
    })
  })
})
