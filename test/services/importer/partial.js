const Code = require('code')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {describe, it} = lab
const {expect} = Code

const PartialImporter = require('../../../server/services/importer/partial')

let ingredients = [
  '1 cup peppers, sliced',
  '1 1/2 tomato, optional',
  'salt and pepper, to taste',
  'handful of lettuce',
  'cilantro',
  ''
].join('\n')

let directions = [
  'Direction 1',
  'Direction 2',
  'Direction 3',
  ''
].join('\n')


// TODO add directions order

describe('services/importer/partial', () => {
  describe('partially entered recipe', () => {
    it('yields a recipe with array of ingredients and directions', (done) => {
      PartialImporter({ recipe_id: 1, ingredients, directions }, (err, recipe) => {
        expect(err).to.be.null()
        expect(Array.isArray(recipe.ingredients)).to.be.true() // TODO use  array()
        expect(Array.isArray(recipe.directions)).to.be.true()
        return done()
      })
    })
  })

  describe('parses ingredients', () => {
    describe('when no ingredients', () => {
      it('yield an error', (done) => {
        let ingredients = ''

        PartialImporter({ ingredients, directions }, (err) => {
          expect(err).to.equal('No Ingredients')
          return done()
        })
      })
    })

    describe('when single ingredients', () => {
      it('yield an error', (done) => {
        let ingredients = '1 cup pepperoni'

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.equal(1)
          expect(recipe.ingredients[0].unit).to.equal('cup')
          return done()
        })
      })
    })

    describe('when amount includes integers and fractions', () => {
      it('combines numbers', (done) => {
        let ingredients = ['1 1/2 cups apples'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.equal(1.5)
          expect(recipe.ingredients[0].unit).to.equal('cups')
          return done()
        })
      })
    })

    describe('when amount includes fractions', () => {
      it('combines numbers', (done) => {
        let ingredients = ['1/2 cups apples'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.equal(0.5)
          expect(recipe.ingredients[0].unit).to.equal('cups')
          return done()
        })
      })
    })

    describe('when amount includes "a" or "an"', () => {
      it('removes "a" or "an"', (done) => {
        let ingredients = ['an apple', 'a pepper'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.equal(1)
          expect(recipe.ingredients[1].amount).to.equal(1)
          return done()
        })
      })
    })

    describe('when no amount', () => {
      it('sets amount property to null', (done) => {
        let ingredients = ['handful lettuce'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.be.null()
          expect(recipe.ingredients[0].unit).to.equal('handful')
          return done()
        })
      })
    })

    describe('when no unit', () => {
      it('sets the unit property to null', (done) => {
        let ingredients = ['1/2 apple'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].unit).to.equal(null)
          expect(recipe.ingredients[0].food).to.equal('apple')
          return done()
        })
      })
    })

    describe('when optional', () => {
      it('sets the optional property to true', (done) => {
        let ingredients = [
          '1/2 apple, optional',
          '1/2 apple (optional)'
        ].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].optional).to.be.true()
          expect(recipe.ingredients[1].optional).to.be.true()
          return done()
        })
      })
    })

    describe('when no amount or unit', () => {
      it('sets amount and unit properties to null', (done) => {
        let ingredients = ['salt'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.be.null()
          expect(recipe.ingredients[0].unit).to.be.null()
          expect(recipe.ingredients[0].food).to.equal('salt')
          return done()
        })
      })
    })

    describe('when "of" is the start of the food', () => {
      it('removes "of"', (done) => {
        let ingredients = ['handful of Panko bread crumbs'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.be.null()
          expect(recipe.ingredients[0].unit).to.equal('handful')
          expect(recipe.ingredients[0].food).to.equal('Panko bread crumbs')
          return done()
        })
      })
    })

    describe('when "and" is the start of the food', () => {
      it('removes "of"', (done) => {
        let ingredients = ['salt and pepper'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.be.null()
          expect(recipe.ingredients[0].unit).to.be.null()
          expect(recipe.ingredients[0].food).to.equal('salt and pepper')
          return done()
        })
      })
    })

    describe('formats the ingredients', () => {
      it('has amount, unit, food, and optional properties', (done) => {
        let ingredients = ['1 cup peppers, sliced, optional'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.ingredients[0].amount).to.equal(1)
          expect(recipe.ingredients[0].unit).to.equal('cup')
          expect(recipe.ingredients[0].food).to.equal('peppers, sliced')
          expect(recipe.ingredients[0].optional).to.be.true()
          return done()
        })
      })
    })
  })

  describe('parses directions', () => {
    describe('when no directions', () => {
      it('yield an error', (done) => {
        let directions = ''

        PartialImporter({ ingredients, directions }, (err) => {
          expect(err).to.equal('No Directions')
          return done()
        })
      })
    })

    describe('formats the directions', () => {
      it('has direction property', (done) => {
        let directions = ['Direction 1'].join('\n')

        PartialImporter({ ingredients, directions }, (err, recipe) => {
          expect(err).to.be.null()
          expect(recipe.directions[0].direction).to.equal('Direction 1')
          return done()
        })
      })
    })
  })
})
