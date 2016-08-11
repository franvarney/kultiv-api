const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {after, before, describe, it} = lab

const Foods = require('../../server/handlers/foods')

const server = new Server()

let id
let unique = Date.now()

describe('handlers/foods', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/foods', handler: Foods.create })
      return done()
    })

    describe('when successfully creates a food', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/foods',
          payload: {
            name: `Food ${unique}`
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

    describe('when successfully creates foods', () => {
      it('yields the ids', (done) => {
        server.inject({
          method: 'POST',
          url: '/foods',
          payload: [{
            name: `Food ${unique} 1`
          }, {
            name: `Food ${unique} 2`
          }]
        }, (response) => {
          console.log(response.result)
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
      server.route({ method: 'GET', path: '/foods/{id}', handler: Foods.get })
      return done()
    })

    describe('when successfully gets a food', () => {
      it('yields the food', (done) => {
        server.inject({
          method: 'GET',
          url: `/foods/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.id).to.equal(id)
          expect(response.result.name).to.equal(`Food ${unique}`)
          return done()
        })
      })
    })
  })
})
