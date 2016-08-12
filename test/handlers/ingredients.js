const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {after, before, describe, it} = lab

const Ingredients = require('../../server/handlers/ingredients')

const server = new Server()

let id
let unique = Date.now()

describe('handlers/ingredients', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/ingredients', handler: Ingredients.create })
      return done()
    })

    describe('when successfully creates a ingredient', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/ingredients',
          payload: {
            amount: 1,
            unit: 'cups',
            food: `Food ${unique}`
          }
        }, (response) => {
          id = response.result.id
          expect(response.statusCode).to.equal(201)
          expect(Object.keys(response.result)).to.equal(['id'])
          expect(typeof response.result.id).to.equal('number')
          return done()
        })
      })
    })

    describe('when successfully creates ingredients', () => {
      it('yields the ids', (done) => {
        server.inject({
          method: 'POST',
          url: '/ingredients',
          payload: [{
            amount: 1.5,
            unit: 'cups',
            food: `sugar`
          }, {
            unit: 'Unit ${unique} 2',
            food: `Food ${unique} 2`
          }]
        }, (response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.result).to.be.array()
          return done()
        })
      })
    })
  })

  describe('get', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'GET', path: '/ingredients/{id}', handler: Ingredients.get })
      return done()
    })

    describe('when successfully gets a ingredient', () => {
      it('yields the ingredient', (done) => {
        server.inject({
          method: 'GET',
          url: `/ingredients/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.id).to.equal(id)
          return done()
        })
      })
    })
  })
})
