const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {after, before, describe, it} = lab

const Units = require('../../server/handlers/units')

const server = new Server()

let id
let unique = Date.now()

describe('handlers/units', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/units', handler: Units.create })
      return done()
    })

    describe('when successfully creates a unit', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/units',
          payload: {
            name: `Unit ${unique}`
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

    describe('when successfully creates units', () => {
      it('yields the ids', (done) => {
        server.inject({
          method: 'POST',
          url: '/units',
          payload: [{
            name: `Unit ${unique} 1`
          }, {
            name: `Unit ${unique} 2`
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
      server.route({ method: 'GET', path: '/units/{id}', handler: Units.get })
      return done()
    })

    describe('when successfully gets a units', () => {
      it('yields the unit', (done) => {
        server.inject({
          method: 'GET',
          url: `/units/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.id).to.equal(id)
          expect(response.result.name).to.equal(`Unit ${unique}`)
          return done()
        })
      })
    })
  })
})
