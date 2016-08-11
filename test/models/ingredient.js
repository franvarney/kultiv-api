const {expect} = require('code')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {describe, it} = lab

const IngredientModel = require('../../server/models/ingredient')

let unique =  Date.now()

describe('models/ingredient', () => {
  describe('findOrCreate', () => {
    it('creates a new ingredient when it doesn\'t exist', (done) => {
      let Ingredient = new IngredientModel({ payload: {
        amount: 1,
        unit: 'cups',
        food: `Food ${unique}`
      }})

      Ingredient.findOrCreate((err, id) => {
        expect(err).to.be.null()
        expect(typeof id).to.equal('number')
        done()
      })
    })

    it('finds an ingredient when it already exists', (done) => {
      let Ingredient = new IngredientModel({ payload: {
        amount: 1,
        unit: 'teaspoons',
        food: 'sugar',
        optional: true
      }})

      Ingredient.findOrCreate((err, id) => {
        expect(err).to.be.null()
        expect(id).to.equal(1)
        done()
      })
    })
  })

  describe('batchFindOrCreate', () => {
    it('creates new ingredients when they don\'t exist', (done) => {
      let Ingredient = new IngredientModel({
        payload: [{
          amount: 1,
          unit: `Unit ${unique} `,
          food: `apples`
        }, {
          amount: 1,
          unit: 'tablespoons',
          food: `Food ${unique} 2`,
          optional: true
        }]
      })

      Ingredient.batchFindOrCreate((err, ids) => {
        expect(err).to.be.null()
        expect(ids).to.be.array()
        done()
      })
    })

    it('finds ingredients when they already exist', (done) => {
      let Ingredient = new IngredientModel({
        payload: [{
          amount: 1,
          unit: 'spoonfuls',
          food: 'sugar'
        }, {
          amount: 1,
          unit: 'slices',
          food: 'apples',
          optional: true
        }]
      })

      Ingredient.batchFindOrCreate((err, ids) => {
        expect(err).to.be.null()
        expect(ids).to.be.array()
        done()
      })
    })
  })
})
