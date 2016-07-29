const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {after, before, describe, it} = lab

const Directions = require('../../server/handlers/directions')

const server = new Server()

let id
let unique = Date.now()

describe('handlers/directions', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/directions', handler: Directions.create })
      return done()
    })

    describe('when successfully creates a direction', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/directions',
          payload: {
            direction: `Direction ${unique}`
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

    describe('when successfully creates directions', () => {
      it('yields the ids', (done) => {
        server.inject({
          method: 'POST',
          url: '/directions',
          payload: [{
            direction: `Direction ${unique} 1`
          }, {
            direction: `Direction ${unique} 2`
          }]
        }, (response) => {
          expect(response.statusCode).to.equal(201)
          expect(Object.keys(response.result)).to.equal(['ids'])
          expect(response.result.ids).to.be.array()
          return done()
        })
      })
    })
  })

  describe('get', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'GET', path: '/directions/{id}', handler: Directions.get })
      return done()
    })

    describe('when successfully gets a direction', () => {
      it('yields the direction', (done) => {
        server.inject({
          method: 'GET',
          url: `/directions/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.id).to.equal(id)
          expect(response.result.direction).to.equal(`Direction ${unique}`)
          return done()
        })
      })
    })
  })
})
