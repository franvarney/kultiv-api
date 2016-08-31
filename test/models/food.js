const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const DB = require('../../server/connections/postgres')
const Food = require('../../server/models/food')

describe('models/food', () => {
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

  describe('findByName', () => {
    describe('when successfully finds by name', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([
            { id: 1, name: 'chickpea' },
            { id: 2, name: 'chicken' }
          ])
        })
        return done()
      })

      it('yields array of foods', (done) => {
        Food
          .set({ name: 'chick' })
          .findByName((err, foods) => {
            expect(err).to.be.null()
            expect(foods).to.be.array()
            expect(foods.length).to.equal(2)
            return done()
          })
      })
    })

    describe('when unsuccessfully finds by name', () => {
      before((done) => {
        tracker.on('query', function (query) {
          return query.response([])
        })
        return done()
      })

      it('yields empty set', (done) => {
        Food
          .set({ name: 'chick' })
          .findByName((err, foods) => {
            expect(err).to.be.null()
            expect(foods).to.be.array()
            expect(foods.length).to.equal(0)
            return done()
          })
      })
    })

    describe('when query fails', () => {
        before((done) => {
          tracker.on('query', function (query) {
            return query.reject()
          })
          return done()
        })

        it('yields an error', (done) => {
          Food
            .set({ name: 'chick' })
            .findByName((err, food) => {
              expect(err).to.not.be.null()
              expect(err).to.be.instanceof(Error)
              expect(food).to.be.undefined()
              return done()
            })
        })
      })
  })

  describe('findOrCreate', () => {
    describe('when successfully creates a food', () => {
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
        Food
          .set({ name: 'test' })
          .findOrCreate((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })

    describe('when successfully finds a food', () => {
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
        Food
          .set({ name: 'test2' })
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
        Food
          .set({ name: 'test' })
          .findOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('batchFindOrCreate', () => {
    describe('when successfully creates foods', () => {
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
        Food
          .set([
            { name: 'food1' },
            { name: 'food2' }
          ])
          .batchFindOrCreate((err, ids) => {
            expect(err).to.be.null()
            expect(ids).to.be.array()
            return done()
          })
      })
    })

    describe('when successfully finds and creates foods', () => {
      before((done) => {
       tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([
                { id: 3, name: 'food3' },
                { id: 4, name: 'food4' }
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
        Food
          .set([
            { name: 'food1' },
            { name: 'food2' },
            { name: 'food3' },
            { name: 'food4' }
          ])
          .batchFindOrCreate((err, ids) => {
            expect(err).to.be.null()
            expect(ids).to.be.array()
            expect(ids.length).to.equal(4)
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
        Food
          .set([
            { name: 'food1' },
            { name: 'food2' },
            { name: 'food3' },
            { name: 'food4' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when second query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([
                { id: 3, name: 'food3' },
                { id: 4, name: 'food4' }
              ])
            },
            function () {
              return query.reject();
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Food
          .set([
            { name: 'food1' },
            { name: 'food2' },
            { name: 'food3' },
            { name: 'food4' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })
  })
})
