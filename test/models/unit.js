const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const DB = require('../../server/connections/postgres')
const Unit = require('../../server/models/unit')

describe('models/unit', () => {
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

  describe('findOrCreate', () => {
    describe('when successfully creates a unit', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response()
            },
            function () {
              return query.response([1]);
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the id', (done) => {
        Unit
          .set({ name: 'test' })
          .findOrCreate((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
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
        Unit
          .set({ name: 'test' })
          .findOrCreate((err, unit) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(unit).to.be.undefined()
            return done()
          })
      })
    })

    describe('when successfully finds a unit', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({ id: 2 })
            },
            function () {
              return query.response();
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the id', (done) => {
        Unit
          .set({ name: 'test2' })
          .findOrCreate((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })
  })

  describe('batchFindOrCreate', () => {
    describe('when successfully creates units', () => {
      before((done) => {
       tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2]);
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the ids', (done) => {
        Unit
          .set([
            { name: 'unit1' },
            { name: 'unit2' }
          ])
          .batchFindOrCreate((err, ids) => {
            expect(err).to.be.null()
            expect(ids).to.be.array()
            return done()
          })
      })
    })

    describe('when successfully finds and creates units', () => {
      before((done) => {
       tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([
                { id: 3, name: 'unit3' },
                { id: 4, name: 'unit4' }
              ])
            },
            function () {
              return query.response([1, 2])
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the ids', (done) => {
        Unit
          .set([
            { name: 'unit1' },
            { name: 'unit2' },
            { name: 'unit3' },
            { name: 'unit4' }
          ])
          .batchFindOrCreate((err, ids) => {
            expect(err).to.be.null()
            expect(ids).to.be.array()
            expect(ids.length).to.equal(4)
            return done()
          })
      })
    })
  })
})
