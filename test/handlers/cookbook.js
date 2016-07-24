const {expect} = require('code')
const {Server} = require('hapi')
const HapiTreeize = require('hapi-treeize')
const Lab = require('lab')
const Sinon = require('sinon')

const lab = exports.lab = Lab.script()
const {before, after, describe, it} = lab

const Cookbook = require('../../server/handlers/cookbook')
const CookbookModel = require('../../server/models/cookbook')

const server = new Server()

let id

describe('handlers/cookbook', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/cookbooks', handler: Cookbook.create })
      return done()
    })

    describe('when successfully creates a cookbook', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/cookbooks',
          payload: { name: 'Hearty Vegetarian' },
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
      server.route({ method: 'GET', path: '/cookbooks/{id}', handler: Cookbook.get })
      return done()
    })

    describe('when successfully gets a cookbook', () => {
      it('yields the cookbook', (done) => {
        server.inject({
          method: 'GET',
          url: `/cookbooks/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.owner_id).to.equal(3)
          expect(response.result.name).to.equal('Hearty Vegetarian')
          expect(response.result.description).to.be.null()
          return done()
        })
      })
    })
  })

  describe('update', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'PUT', path: '/cookbooks/{id}', handler: Cookbook.update })
      return done()
    })

    describe('when successfully updates a cookbook', () => {
      it('yields no content', (done) => {
        server.inject({
          method: 'PUT',
          url: `/cookbooks/${id}`,
          payload: { description: 'Test description' },
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()

          let cookbook = new CookbookModel({ payload: { id } })

          return cookbook.findById((err, found) => {
            expect(err).to.be.null()
            expect(found.description).to.equal('Test description')
            expect(found.created_at).to.not.equal(found.updated_at)
            return done()
          })
        })
      })
    })
  })

  describe('delete', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'DELETE', path: '/cookbooks/{id}', handler: Cookbook.delete })
      return done()
    })

    describe('when successfully deletes a cookbook', () => {
      it('yields no content', (done) => {
        server.inject({
          method: 'DELETE',
          url: `/cookbooks/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()

          let cookbook = new CookbookModel({ payload: { id } })

          return cookbook.findById((err, found) => {
            expect(err[1]).to.equal('Not Found')
            expect(found).to.be.undefined()
            return done()
          })
        })
      })
    })
  })

  describe('allByUser', () => {
    before((done) => {
      server.connection()
      server.register(HapiTreeize, (err) => new Error(err))
      server.route({ method: 'GET', path: '/users/{id}/cookbooks', handler: Cookbook.allByUser })
      return done()
    })

    describe('when successfully gets user cookbooks', () => {
      it('yields an array of cookbooks', (done) => {
        server.inject({
          method: 'GET',
          url: `/users/3/cookbooks`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result).to.be.array()
          return done()
        })
      })
    })
  })
})
