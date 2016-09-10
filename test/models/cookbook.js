const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const Cookbook = require('../../server/models/cookbook')
const CookbookData = require('../fixtures/cookbooks')
const CookbookUnformattedData = require('../fixtures/cookbook-unformatted')
const DB = require('../../server/connections/postgres')
const TrackerHelper = require('../helpers/tracker')

describe('models/cookbook', () => {
  let tracker = MockKnex.getTracker()
  let queries = {}

  before((done) => {
    MockKnex.mock(DB)
    return done()
  })

  beforeEach((done) => {
    queries = {
      create: {
        name: 'Test Cookbook',
        description: 'A description',
        owner_id: 3
      },
      deleteById: { id: 1 },
      findByOwner: { owner_id: 3 },
      findByCollaborator: { collaborator_id: 2 },
      findById: { id: 2 },
      update: {
        id: 2,
        name: 'Test Cookbook Updated'
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
    describe('creates a cookbook', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, [1]))
        return done()
      })

      it('yields the id', (done) => {
        Cookbook
          .set(queries.create)
          .create((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            expect(id).to.equal(1)
            return done()
          })
      })
    })

    describe('bad cookbook data is submitted', () => {
      it('yields an error', (done) => {
        Cookbook
          .set({})
          .create((err, id) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(err.isJoi).to.be.true()
            expect(id).to.be.undefined()
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
        Cookbook
          .set(queries.create)
          .create((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('deleteById', () => {
    describe('deletes a cookbook', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, 1))
        return done()
      })

      it('yields the deleted count', (done) => {
        Cookbook
          .set(queries.deleteById)
          .deleteById((err, count) => {
            expect(err).to.be.null()
            expect(count).to.equal(1)
            return done()
          })
      })
    })

    describe('cookbook does not exist', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, 0))
        return done()
      })

      it('yields an error', (done) => {
        Cookbook
          .set(queries.deleteById)
          .deleteById((err, count) => {
            expect(err).to.be.null()
            expect(count).to.equal(0)
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
        Cookbook
          .set(queries.deleteById)
          .deleteById((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('findByCollaborator', () => {
    describe('collaborator has cookbooks', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, [CookbookData[1]]))
        return done()
      })

      it('yields an array of cookbooks', (done) => {
        Cookbook
          .set(queries.findByCollaborator)
          .findByCollaborator((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            expect(cookbooks.length).to.equal(1)
            return done()
          })
      })
    })

    describe('collaborator has no cookbooks', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Cookbook
          .set(queries.findByCollaborator)
          .findByCollaborator((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            expect(cookbooks.length).to.equal(0)
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
        Cookbook
          .set(queries.findByCollaborator)
          .findByCollaborator((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('findById', () => {
    describe('cookbook exists', () => {
      before((done) => {
        let userData = {
          'creator:id': 2,
          'creator:username': 'username'
        }

        tracker.on('query', function (query, step) {
          return [
            TrackerHelper.response.bind(null, CookbookUnformattedData, query),
            TrackerHelper.response.bind(null, userData, query),
          ][step - 1]()
        })
        tracker.on('query', TrackerHelper.response.bind(null, CookbookData[0]))
        return done()
      })

      it('yields a cookbook', (done) => {
        Cookbook
          .set(queries.findById)
          .findById((err, cookbook) => {
            expect(err).to.be.null()
            expect(cookbook.id).to.be.equal(1)
            expect(cookbook['creator:id']).to.be.equal(3)
            return done()
          })
      })
    })

    describe('cookbook does not exist', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.noResults)
        return done()
      })

      it('yields an error', (done) => {
        Cookbook
          .set(queries.findById)
          .findById((err) => {
            expect(err).to.not.be.null()
            expect(err).to.equal([ 'notFound', 'Not Found' ])
            return done()
          })
      })
    })

    describe('first query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Cookbook
          .set(queries.findById)
          .findById((err, cookbook) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })

    describe('second query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            TrackerHelper.response.bind(null, CookbookUnformattedData, query),
            TrackerHelper.reject
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Cookbook
          .set(queries.findById)
          .findById((err, cookbook) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('findByOwner', () => {
    describe('owner has cookbooks', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, [CookbookData[0]]))
        return done()
      })

      it('yields an array of cookbooks', (done) => {
        Cookbook
          .set(queries.findByOwner)
          .findByOwner((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            return done()
          })
      })
    })

    describe('owner has no cookbooks', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Cookbook
          .set(queries.findByOwner)
          .findByOwner((err, cookbooks) => {
            expect(err).to.be.null()
            expect(cookbooks).to.be.array()
            expect(cookbooks.length).to.equal(0)
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
        Cookbook
          .set(queries.findByOwner)
          .findByOwner((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })

  describe('update', () => {
    describe('updates a cookbook', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            TrackerHelper.response.bind(null, CookbookUnformattedData, query),
            TrackerHelper.response.bind(null, [2], query)
          ][step - 1]()
        })
        return done()
      })

      it('yields the id', (done) => {
        Cookbook
          .set(queries.update)
          .update((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            expect(id).to.equal(2)
            return done()
          })
      })
    })

    describe('no id is submitted', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.noResults)
        return done()
      })

      it('yields an error', (done) => {
        Cookbook
          .set({ test: false })
          .update((err) => {
            expect(err).to.not.be.null()
            expect(err).to.equal([ 'notFound', 'Not Found' ])
            return done()
          })
      })
    })

    describe('bad data is submitted', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, CookbookData[1]))
        return done()
      })

      it('yields an error', (done) => {
        Cookbook
          .set(Object.assign(queries.update, { name: 'no' }))
          .update((err, id) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(err.isJoi).to.be.true()
            expect(id).to.be.undefined()
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
        Cookbook
          .set(queries.update)
          .update((err) => {
            expect(err).to.not.be.null()
            return done()
          })
      })
    })
  })
})
