const {expect} = require('code')
const {Server} = require('hapi')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {after, before, describe, it} = lab

const User = require('../../server/handlers/user')
const UserModel = require('../../server/models/user')

const server = new Server()

let id
let unique = Date.now()

describe('handlers/user', () => {
  describe('create', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'POST', path: '/users', handler: User.create })
      return done()
    })

    describe('when successfully creates a user', () => {
      it('yields the id', (done) => {
        server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: `${unique}`,
            password: 'Secret',
            email: `${unique}@example.com`
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
  })

  describe('get', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'GET', path: '/users/{id}', handler: User.get })
      return done()
    })

    describe('when successfully gets a user', () => {
      it('yields the user', (done) => {
        server.inject({
          method: 'GET',
          url: `/users/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(200)
          expect(response.result.id).to.equal(id)
          expect(response.result.username).to.equal(`${unique}`)
          expect(response.result.first_name).to.be.null()
          return done()
        })
      })
    })
  })

  // TODO fix this
  // describe('update', () => {
  //   before((done) => {
  //     server.connection()
  //     server.route({ method: 'PUT', path: '/users/{id}', handler: User.update })
  //     return done()
  //   })

  //   describe('when successfully updates a user', () => {
  //     it('yields no content', (done) => {
  //       server.inject({
  //         method: 'PUT',
  //         url: `/users/${id}`,
  //         payload: { first_name: 'Testname' },
  //         credentials: { user: 3 }
  //       }, (response) => {
  //         expect(response.statusCode).to.equal(204)
  //         expect(response.result).to.be.null()

  //         let user = new UserModel({ payload: { id } })

  //         return user.findById((err, found) => {
  //           expect(err).to.be.null()
  //           expect(found.first_name).to.equal('Testname')
  //           expect(found.created_at).to.not.equal(found.updated_at)
  //           return done()
  //         })
  //       })
  //     })
  //   })
  // })

  describe('delete', () => {
    before((done) => {
      server.connection()
      server.route({ method: 'DELETE', path: '/users/{id}', handler: User.delete })
      return done()
    })

    describe('when successfully deletes a user', () => {
      it('yields no content', (done) => {
        server.inject({
          method: 'DELETE',
          url: `/users/${id}`,
          credentials: { user: 3 }
        }, (response) => {
          expect(response.statusCode).to.equal(204)
          expect(response.result).to.be.null()

          let user = new UserModel({ payload: { id } })

          return user.findById((err, found) => {
            expect(err[1]).to.equal('Not Found')
            expect(found).to.be.undefined()
            return done()
          })
        })
      })
    })
  })
})
