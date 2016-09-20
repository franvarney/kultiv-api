const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const DB = require('../../server/connections/postgres')
const TrackerHelper = require('../helpers/tracker')
const User = require('../../server/models/user')
const UserData = require('../fixtures/users')

describe('models/user', () => {
  let tracker = MockKnex.getTracker()
  let queries = {}

  before((done) => {
    MockKnex.mock(DB)
    return done()
  })

  beforeEach((done) => {
    queries = {
      create: {
        email: 'test2@gmail.com',
        username: 'username2',
        password: 'secret'
      },
      deleteById: { id: 2 },
      findById: { id: 2 },
      update: {
        id: 2,
        first_name: 'John'
      }
    }

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

  describe('create', () => {
    describe('creates a user', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, [UserData[0].id]))
        return done()
      })

      it('yields the id', (done) => {
        User
          .set(queries.create)
          .create((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            expect(id).to.equal(2)
            return done()
          })
      })

    })

    describe('create', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, { id: 1, username: 'username2' }))
        return done()
      })

      it('yields the id and username', (done) => {
        User
          .set(queries.create)
          .create(['id', 'username'], (err, user) => {
            expect(err).to.be.null()
            expect(user.id).to.equal(1)
            expect(user.username).to.equal('username2')
            return done()
          })
      })
    })

    describe('email already exists', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        User
          .set(queries.create)
          .create((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })

    describe('username already exists', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        User
          .set(Object.assign({}, queries.create, { username: 'username' }))
          .create((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('deleteById', () => {
    describe('deletes a user', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, 1))
        return done()
      })

      it('yields the the deleted count', (done) => {
        User
          .set(queries.deleteById)
          .deleteById((err, count) => {
            expect(err).to.be.null()
            expect(count).to.equal(1)
            return done()
          })
      })
    })

    describe('user does not exist', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, 0))
        return done()
      })

      it('yields the the deleted count', (done) => {
        User
          .set(queries.deleteById)
          .deleteById((err, count) => {
            expect(err).to.be.null()
            expect(count).to.equal(0)
            return done()
          })
      })
    })
  })

  describe('findByEmailOrUsername', () => {
    describe('finds a user by username', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, UserData[0]))
        return done()
      })

      it('yields the user', (done) => {
        User
          .set({ username: 'username' })
          .findByEmailOrUsername((err, user) => {
            expect(err).to.be.null()
            expect(user.username).to.equal('username')
            return done()
          })
      })
    })

    describe('finds a user by email', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, UserData[0]))
        return done()
      })

      it('yields the user', (done) => {
        User
          .set({ email: 'test@gmail.com' })
          .findByEmailOrUsername((err, user) => {
            expect(err).to.be.null()
            expect(user.email).to.equal('test@gmail.com')
            return done()
          })
      })
    })

    describe('finds a user by username and email', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, UserData[0]))
        return done()
      })

      it('yields the user', (done) => {
        User
          .set({ username: 'username', email: 'test@gmail.com' })
          .findByEmailOrUsername((err, user) => {
            expect(err).to.be.null()
            expect(user.email).to.equal('test@gmail.com')
            expect(user.username).to.equal('username')
            return done()
          })
      })
    })

    describe('user does not exist', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.noResults)
        return done()
      })

      it('yields the user', (done) => {
        User
          .set({ username: 'username' })
          .findByEmailOrUsername((err, user) => {
            expect(err).to.be.null()
            expect(user).to.be.undefined()
            return done()
          })
      })
    })

    describe('query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        User
          .set({ username: 'username' })
          .findByEmailOrUsername((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('findById', () => {
    describe('there is a user', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, UserData[0]))
        return done()
      })

      it('yields a user', (done) => {
        User
          .set(queries.findById)
          .findById((err, user) => {
            expect(err).to.be.null()
            expect(user.id).to.be.equal(2)
            return done()
          })
      })
    })

    describe('user does not exist', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.noResults)
        return done()
      })

      it('yields nothing', (done) => {
        User
          .set(queries.findById)
          .findById((err, user) => {
            expect(err).to.be.null()
            expect(user).to.be.undefined()
            return done()
          })
      })
    })

    describe('query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        User
          .set(queries.findById)
          .findById((err, user) => {
            expect(err).to.not.be.null()
            expect(user).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('update', () => {
    describe('updates the user', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, [2]))
        return done()
      })

      it('yields the id', (done) => {
        User
          .set(queries.update)
          .update((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            expect(id).to.equal(2)
            return done()
          })
      })
    })

    describe('hashes password', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, [2]))
        return done()
      })

      it('yields the id', (done) => {
        User
          .set({ id: 2, password: 'Password' })
          .update((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            expect(id).to.equal(2)
            return done()
          })
      })
    })

    describe('updates the user', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, { id: 2, username: 'username' }))
        return done()
      })

      it('yields the id and username', (done) => {
        User
          .set(queries.update)
          .update(['id', 'username'], (err, user) => {
            expect(err).to.be.null()
            expect(user.id).to.equal(2)
            expect(user.username).to.equal('username')
            return done()
          })
      })
    })
  })
})
