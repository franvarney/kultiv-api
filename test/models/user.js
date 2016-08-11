const Code = require('code')
const Lab = require('lab')

const lab = exports.lab = Lab.script()
const {describe, it} = lab
const {expect} = Code

const UserModel = require('../../server/models/user')

let id
let unique = Date.now()

describe('models/user', () => {
  describe('create', () => {
    it('creates a user', (done) => {
      let User = new UserModel({ payload: {
        username: `${unique}test`,
        email: `${unique}test@exmaple.com`,
        password: 'secret'
      }})

      User.create((err, user) => {
        id = user
        expect(err).to.be.null()
        expect(typeof id).to.equal('number')
        done()
      })
    })
  })

  describe('findByEmailOrUsername', () => {
    it('finds a user by email', (done) => {
      let User = new UserModel({ payload: {
        email: `${unique}test@exmaple.com`
      }})

      User.findByEmailOrUsername((err, user) => {
        expect(err).to.be.null()
        expect(user.id).to.equal(id)
        done()
      })
    })

    it('finds a user by username', (done) => {
      let User = new UserModel({ payload: {
        username: `${unique}test`
      }})

      User.findByEmailOrUsername((err, user) => {
        expect(err).to.be.null()
        expect(user.id).to.equal(id)
        done()
      })
    })
  })

  describe('update', () => {
    it('updates a user', (done) => {
      let User = new UserModel({ payload: {
        id,
        first_name: 'test'
      }})

      User.update((err, id) => {
        expect(err).to.be.null()
        expect(id).to.equal(id)
        done()
      })
    })
  })
})
