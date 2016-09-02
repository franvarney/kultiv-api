const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {after, before, describe, it} = lab

const Recipe = require('../../server/handlers/recipe')
const RecipeModel = require('../../server/models/recipe')

const server = new Server()

let id
let unique = Date.now()

describe('handlers/recipe', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/recipes', handler: Recipe.create })
      return done()
    })

    describe('when successfully creates a recipe', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/recipes',
          payload:   {
            title: `The Best Pizza ${unique}`,
            cookbook_id: 3,
            cook_time: 4323,
            prep_time: 1232,
            description: 'The best pizza evar!1',
            is_private: false,
            yield_amount: 8,
            yield_unit: 'servings'
          },
          credentials: { user: 3 }
        }, (response) => {
          id = response.result.id
          expect(response.statusCode).to.equal(201)
          expect(Object.keys(response.result)).to.equal(['id'])
          expect(typeof response.result.id).to.equal('number')
          return done()
        })
      })
    })
  })

  describe('get', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'GET', path: '/recipes/{id}', handler: Recipe.get })
      return done()
    })

    describe('when successfully gets a recipe', () => {
      it('yields the recipe', (done) => {
        server.inject({
          method: 'GET',
          url: `/recipes/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.description).to.equal('The best pizza evar!1')
          return done()
        })
      })
    })

    // TODO full recipe
  })

  describe('delete', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'DELETE', path: '/recipes/{id}', handler: Recipe.delete })
      return done()
    })

    describe('when successfully deletes a recipe', () => {
      it('yields no content', (done) => {
        server.inject({
          method: 'DELETE',
          url: `/recipes/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()

          return RecipeModel.set({ id }).findById((err, found) => {
            expect(err[1]).to.equal('Recipe Not Found')
            expect(found).to.be.undefined()
            return done()
          })
        })
      })
    })
  })
})
