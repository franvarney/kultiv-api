const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const DB = require('../../server/connections/postgres')
const Ingredient = require('../../server/models/ingredient')

describe('models/ingredient', () => {
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
    describe('when successfully creates an ingredient', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({ id: 1 })
            },
            function () {
              return query.response({ id: 2 })
            },
            function () {
              return query.response({ id: 1 })
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the id', (done) => {
        Ingredient
          .set({ amount: 1, unit: 'spoons', food: 'liquid' })
          .findOrCreate((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            return done()
          })
      })
    })

    describe('when successfully finds an ingredient', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({ id: 2 })
            },
            function () {
              return query.response({ id: 3 })
            },
            function () {
              return query.response({ id: 4 })
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the id', (done) => {
        Ingredient
          .set({ amount: 2, unit: 'tablespoons', food: 'tomato sauce' })
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
              return query.response({ id: 2 })
            },
            function () {
              return query.response()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set({ amount: 1, unit: 'spoons', food: 'liquid' })
          .findOrCreate((err, food) => {
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
              return query.response({ id: 1 })
            },
            function () {
              return query.reject()
            },
            function () {
              return query.response()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set({ amount: 1, unit: 'spoons', food: 'liquid' })
          .findOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when third query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response({ id: 1 })
            },
            function () {
              return query.response({ id: 2 })
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set({ amount: 1, unit: 'spoons', food: 'liquid' })
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
    describe('when successfully creates ingredients', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.response([3, 4])
            },
            function () {
              return query.response([
                { id: 1, name: 'tomato sauce' },
                { id: 2, name: 'apple' }
              ])
            },
            function () {
              return query.response([
                { id: 3, name: 'none' },
                { id: 4, name: 'tablespoons' }
              ])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the ids', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, ids) => {
            expect(err).to.be.null()
            expect(ids).to.be.array()
            return done()
          })
      })
    })

    describe('when successfully finds ingredients', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.response([3, 4])
            },
            function () {
              return query.response([
                { id: 1, name: 'tomato sauce' },
                { id: 2, name: 'apple' }
              ])
            },
            function () {
              return query.response([
                { id: 3, name: 'none' },
                { id: 4, name: 'tablespoons' }
              ])
            },
            function () {
              return query.response([
                { id: 1, amount: 2, food_id: 1, unit_id: 4, optional: false },
                { id: 2, amount: 1, food_id: 2, unit_id: 3, optional: false }
              ])
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the ids', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, ids) => {
            expect(err).to.be.null()
            expect(ids).to.be.array()
            return done()
          })
      })
    })

    describe('when successfully finds and creates ingredients', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([{ id: 1, name: 'tomato sauce' }])
            },
            function () {
              return query.response([{ id: 3, name: 'none' }])
            },
            function () {
              return query.response([2, 3, 4])
            },
            function () {
              return query.response([2, 4])
            },
            function () {
              return query.response([
                { id: 1, name: 'tomato sauce' },
                { id: 2, name: 'apple' },
                { id: 3, name: 'salt and pepper' },
                { id: 4, name: 'applesauce' }
              ])
            },
            function () {
              return query.response([
                { id: 2, name: 'cups' },
                { id: 3, name: 'none' },
                { id: 4, name: 'tablespoons' }
              ])
            },
            function () {
              return query.response([
                { id: 1, amount: 2, food_id: 1, unit_id: 4, optional: false }
              ])
            },
            function () {
              return query.response([2, 3, 4])
            }
          ][step - 1]()
        })
        return done()
      })

      it('should yield the ids', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' },
            { food: 'salt and pepper', optional: true },
            { amount: .5, unit: 'cups', food: 'applesauce' }
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
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
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
              return query.response([])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when third query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when fourth query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when fifth query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.response([3, 4])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when sixth query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.response([3, 4])
            },
            function () {
              return query.response([
                { id: 1, name: 'tomato sauce' },
                { id: 2, name: 'apple' }
              ])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when seventh query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.response([3, 4])
            },
            function () {
              return query.response([
                { id: 1, name: 'tomato sauce' },
                { id: 2, name: 'apple' }
              ])
            },
            function () {
              return query.response([
                { id: 1, name: 'tablespoons' },
                { id: 2, name: 'none' }
              ])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
          ])
          .batchFindOrCreate((err, food) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(food).to.be.undefined()
            return done()
          })
      })
    })

    describe('when eighth query fails', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            function () {
              return query.response([])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.response([1, 2])
            },
            function () {
              return query.response([3, 4])
            },
            function () {
              return query.response([
                { id: 1, name: 'tomato sauce' },
                { id: 2, name: 'apple' }
              ])
            },
            function () {
              return query.response([
                { id: 1, name: 'tablespoons' },
                { id: 2, name: 'none' }
              ])
            },
            function () {
              return query.response([])
            },
            function () {
              return query.reject()
            }
          ][step - 1]()
        })
        return done()
      })

      it('yields an error', (done) => {
        Ingredient
          .set([
            { amount: 2, unit: 'tablespoons', food: 'tomato sauce' },
            { amount: 1, food: 'apple' }
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
