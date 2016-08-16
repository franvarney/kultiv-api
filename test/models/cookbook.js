const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const Cookbook = require('../../server/models/cookbook')
const DB = require('../../server/connections/postgres')

describe('models/cookbook', () => {
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

  describe('create', () => {
    describe('when successfully creates a cookbook', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([1])
        })
        return done()
      })

      it('should yield the id', (done) => {
        Cookbook
          .set({ name: 'Test Cookbook', description: 'A description', owner_id: 3 })
          .create((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })
  })

  describe('deleteById', () => {
    describe('when successfully deletes a cookbook', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                description: null,
                is_private: false,
                owner_id: 3,
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
        Cookbook
          .set({ id: 1 })
          .deleteById((err, count) => {
            expect(err).to.be.null()
            expect(count).to.equal(1)
            return done()
          })
      })
    })

    describe('when cookbook to delete does not exist', () => {
      before((done) => {
        tracker.install()
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response()
            },
            function () {
              return query.response(0);
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the the deleted count', (done) => {
        Cookbook
          .set({ id: 1 })
          .deleteById((err) => {
            expect(err).to.equal(['notFound', 'Not Found'])
            return done()
          })
      })
    })
  })

  describe('findByCollaborator', () => {
    describe('when successful and there are cookbooks', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([{
            id: 1,
            description: null,
            is_private: false,
            'creator:id': 2,
            'creator:username': 'samdoe',
            created_at: Date.now(),
            updated_at: Date.now()
          }])
        })
        return done()
      })

      it('should yield an array of cookbooks', (done) => {
        Cookbook
          .set({ owner_id: 2 })
          .findByOwner((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            return done()
          })
      })
    })

    describe('when successful but there are no cookbooks', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([])
        })
        return done()
      })

      it('should yield an empty array', (done) => {
        Cookbook
          .set({ owner_id: 2 })
          .findByOwner((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            expect(cookbooks.length).to.equal(0)
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

      it('should yield an error', (done) => {
        Cookbook
          .set({ owner_id: 2 })
          .findByCollaborator((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('findById', () => {
    describe('when successful and there is a cookbook', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response({
            id: 1,
            description: null,
            is_private: false,
            'creator:id': 2,
            'creator:username': 'samdoe',
            created_at: Date.now(),
            updated_at: Date.now()
          })
        })
        return done()
      })

      it('should yield a cookbook', (done) => {
        Cookbook
          .set({ id: 2 })
          .findById((err, cookbook) => {
            expect(err).to.be.null()
            expect(cookbook.id).to.be.equal(1)
            return done()
          })
      })
    })

    describe('when cookbook does not exist', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([])
        })
        return done()
      })

      it('should yield an error', (done) => {
        Cookbook
          .set({ id: 2 })
          .findById((err) => {
            expect(err).to.not.be.null()
            expect(err).to.equal([ 'notFound', 'Not Found' ])
            return done()
          })
      })
    })
  })

  describe('findByOwner', () => {
    describe('when successful and cookbooks', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([{
            id: 1,
            description: null,
            is_private: false,
            'creator:id': 3,
            'creator:username': 'samdoe',
            created_at: Date.now(),
            updated_at: Date.now()
          }])
        })
        return done()
      })

      it('should yield an array of cookbooks', (done) => {
        Cookbook
          .set({ owner_id: 3 })
          .findByOwner((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            return done()
          })
      })
    })

    describe('when successful but no cookbooks', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([])
        })
        return done()
      })

      it('should yield an empty array', (done) => {
        Cookbook
          .set({ owner_id: 3 })
          .findByOwner((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            expect(cookbooks.length).to.equal(0)
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

      it('should yield an error', (done) => {
        Cookbook
          .set({ owner_id: 2 })
          .findByOwner((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('update', () => {
    describe('when successful', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({
                id: 1,
                description: null,
                is_private: false,
                owner_id: 3,
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
        Cookbook
          .set({ name: 'Test Cookbook Updated' })
          .update((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })

    describe('when found', () => {
      before((done) => {
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
        Cookbook
          .set({ id: 2, name: 'Test Cookbook Updated' })
          .update((err) => {
            expect(err).to.not.be.null()
            expect(err).to.equal([ 'notFound', 'Not Found' ])
            return done()
          })
      })
    })
  })
})
