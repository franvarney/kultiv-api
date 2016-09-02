const {expect} = require('code')
const Lab = require('lab')
const MockKnex = require('mock-knex')

const lab = exports.lab = Lab.script()
const {after, afterEach, before, beforeEach, describe, it} = lab

const DB = require('../../server/connections/postgres')
const Recipe = require('../../server/models/recipe')
const RecipesData = require('../fixtures/recipes')
const RecipesFullData = require('../fixtures/recipes-full')
const TrackerHelper = require('../helpers/tracker')

describe.only('models/recipe', () => {
  let tracker = MockKnex.getTracker()
  let queries = {}

  before((done) => {
    MockKnex.mock(DB)
    return done()
  })

  beforeEach((done) => {
    queries = {
      create: {
        title: 'Test Recipe',
        cook_time: 1234,
        prep_time: 5678,
        description: 'Test description',
        is_private: false,
        yield_amount: 8,
        yield_unit: 'servings',
        user_id: 3
      },
      findById: { id: 1 },
      findByUserId: { user_id: 3 },
      findByCookbookId: { cookbook_id: 2 },
      findByTitle: { title: 'Tes' }
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
    describe('when successfully creates a recipe', () => {
      before((done) => {
        tracker.on('query', function (query, step) {
          return [
            TrackerHelper.response.bind(null, { id: 2 }, query), // unit id
            TrackerHelper.response.bind(null, [1], query), // new recipe id
          ][step - 1]()
        })
        return done()
      })

      it('yields the id', (done) => {
        Recipe
          .set(queries.create)
          .create((err, id) => {
            expect(err).to.be.null()
            expect(typeof id).to.equal('number')
            expect(id).to.equal(1)
            return done()
          })
      })
    })

    describe('when entering bad recipe data', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, { id: 2 })) // unit id
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set({ yield_unit: 'servings' }) // bad data
          .create((err, id) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(err.isJoi).to.be.true()
            expect(id).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.create)
          .create((err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('findById', () => {
    describe('when successfully finds a recipe by id', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesData[0]))
        return done()
      })

      it('yields the recipe', (done) => {
        Recipe
          .set(queries.findById)
          .findById((err, recipe) => {
            expect(err).to.be.null()
            expect(recipe.id).to.equal(1)
            expect(recipe.title).to.equal('Test Recipe')
            return done()
          })
      })
    })

    describe('when successfully finds a recipe by id with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesFullData[0]))
        return done()
      })

      it('yields the recipe with ingredients and directions', (done) => {
        Recipe
          .set(queries.findById)
          .findById((err, recipe) => {
            expect(err).to.be.null()
            expect(recipe.id).to.equal(1)
            expect(recipe.title).to.equal('Test Recipe')
            expect(recipe['ingredients:id']).to.equal(1)
            expect(recipe['directions:id']).to.equal(1)
            return done()
          })
      })
    })

    describe('when unsuccessfully finds a recipe by id', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.noResults)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findById)
          .findById((err, recipe) => {
            expect(err).to.equal(['notFound', 'Recipe Not Found'])
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })

    describe('when unsuccessfully finds a recipe by id with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.noResults)
        return done()
      })

      it('yields the recipe with ingredients and directions', (done) => {
        Recipe
          .set(queries.findById)
          .findById(true, (err, recipe) => {
            expect(err).to.equal(['notFound', 'Recipe Not Found'])
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findById)
          .findById((err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails getting recipe with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findById)
          .findById(true, (err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('findByUserId', () => {
    describe('when successfully finds recipes by user id', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesData))
        return done()
      })

      it('yields user\'s recipes', (done) => {
        Recipe
          .set(queries.findByUserId)
          .findByUserId((err, recipes) => {
            expect(err).to.be.null()
            expect(recipes.length).to.equal(2)
            return done()
        })
      })
    })

    describe('when successfully finds recipes by user id with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesFullData))
        return done()
      })

      it('yields user\'s recipes', (done) => {
        Recipe
          .set(queries.findByUserId)
          .findByUserId(true, (err, recipes) => {
            expect(err).to.be.null()
            expect(recipes.length).to.equal(2)
            expect(recipes[0]['ingredients:id']).to.equal(1)
            expect(recipes[0]['directions:id']).to.equal(1)
            return done()
          })
      })
    })

    describe('when unsuccessfully finds a recipes by user id', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Recipe
          .set(queries.findByUserId)
          .findByUserId((err, recipes) => {
            expect(err).to.be.null()
            expect(recipes).to.equal([])
            return done()
          })
      })
    })

    describe('when unsuccessfully finds recipes by user id with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Recipe
          .set(queries.findByUserId)
          .findByUserId(true, (err, recipes) => {
            expect(err).to.be.null()
            expect(recipes).to.equal([])
            return done()
          })
      })
    })

    describe('when first query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findByUserId)
          .findByUserId((err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails getting user recipes with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findByUserId)
          .findByUserId(true, (err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('findByCookbookId', () => {
    describe('when successfully finds recipes by cookbook id', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesData))
        return done()
      })

      it('yields cookbook\'s recipes', (done) => {
        Recipe
          .set(queries.findByCookbookId)
          .findByCookbookId((err, recipes) => {
            expect(err).to.be.null()
            expect(recipes.length).to.equal(2)
            return done()
        })
      })
    })

    describe('when successfully finds recipes by cookbook id with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesFullData))
        return done()
      })

      it('yields cookbook\'s recipes', (done) => {
        Recipe
          .set(queries.findByCookbookId)
          .findByCookbookId(true, (err, recipes) => {
            expect(err).to.be.null()
            expect(recipes.length).to.equal(2)
            expect(recipes[0]['ingredients:id']).to.equal(1)
            expect(recipes[0]['directions:id']).to.equal(1)
            return done()
          })
      })
    })

    describe('when unsuccessfully finds recipes by cookbook id', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Recipe
          .set(queries.findByCookbookId)
          .findByCookbookId((err, recipes) => {
            expect(err).to.be.null()
            expect(recipes).to.equal([])
            return done()
          })
      })
    })

    describe('when unsuccessfully finds recipes by cookbook id with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Recipe
          .set(queries.findByCookbookId)
          .findByCookbookId(true, (err, recipes) => {
            expect(err).to.be.null()
            expect(recipes).to.equal([])
            return done()
          })
      })
    })

    describe('when first query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findByCookbookId)
          .findByCookbookId((err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails getting cookbook recipes with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findByCookbookId)
          .findByCookbookId(true, (err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })
  })

  describe('findByTitle', () => {
    describe('when successfully finds recipes by similar title', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesData))
        return done()
      })

      it('yields recipes', (done) => {
        Recipe
          .set(queries.findByTitle)
          .findByTitle((err, recipes) => {
            expect(err).to.be.null()
            expect(recipes.length).to.equal(2)
            return done()
        })
      })
    })

    describe('when successfully finds recipes by similar title with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.response.bind(null, RecipesFullData))
        return done()
      })

      it('yields recipes', (done) => {
        Recipe
          .set(queries.findByTitle)
          .findByTitle(true, (err, recipes) => {
            expect(err).to.be.null()
            expect(recipes.length).to.equal(2)
            expect(recipes[0]['ingredients:id']).to.equal(1)
            expect(recipes[0]['directions:id']).to.equal(1)
            return done()
          })
      })
    })

    describe('when unsuccessfully finds recipes by a similar title', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Recipe
          .set(queries.findByTitle)
          .findByTitle((err, recipes) => {
            expect(err).to.be.null()
            expect(recipes).to.equal([])
            return done()
          })
      })
    })

    describe('when unsuccessfully finds recipes by similar title with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.emptySet)
        return done()
      })

      it('yields an empty array', (done) => {
        Recipe
          .set(queries.findByTitle)
          .findByTitle(true, (err, recipes) => {
            expect(err).to.be.null()
            expect(recipes).to.equal([])
            return done()
          })
      })
    })

    describe('when first query fails', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findByTitle)
          .findByTitle((err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })

    describe('when first query fails getting recipes by similar title with ingredients and directions', () => {
      before((done) => {
        tracker.on('query', TrackerHelper.reject)
        return done()
      })

      it('yields an error', (done) => {
        Recipe
          .set(queries.findByTitle)
          .findByTitle(true, (err, recipe) => {
            expect(err).to.not.be.null()
            expect(err).to.be.instanceof(Error)
            expect(recipe).to.be.undefined()
            return done()
          })
      })
    })
  })
})
