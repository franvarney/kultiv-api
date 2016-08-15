const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:user')

const Model = require('./base')
const UserSchema = require('../schemas/user')

const TABLE_NAME = 'users'
const SALT_WORK_FACTOR = 10

function hashPassword (password, done) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return Logger.error(err), done(err)

    Bcrypt.hash(password, salt, (err, hashed) => {
      if (err) return Logger.error(err), done(err)
      return done(null, hashed)
    })
  })
}

const User = Model.createModel({
  name: TABLE_NAME,
  schema: UserSchema.general,

  create (done) {
    Logger.debug('user.create')

    this.findByEmailOrUsername((err, user) => {
      if (err) return Logger.error(err), done(err)
      if (user) return done(['conflict', 'User Already Exists'])

      hashPassword(this.data.password, (err, hashed) => {
        if (err) return Logger.error(err), done(err)
        this.data.password = hashed
        this.create(done)
      })
    })
  },

  findByEmailOrUsername (done) {
    Logger.debug('user.findByEmailOrUsername')

    let {email, username} = this.data

    let query = this.knex(this.name)
                    .select('id', 'username', 'email', 'password')
    if (email) query.where('email', email)
    else query.where('username', username)

    query
      .whereNull('deleted_at')
      .first()
      .asCallback((err, user) => {
        if (err) return Logger.error(err), done(err)
        return done(null, user)
      })
  },

  update (done) {
    Logger.debug('user.update')

    this.findById((err, user) => {
      if (err) return Logger.error(err), done(err)
      if (!user) return done(['notFound', 'User not found'])

      user = Object.assign({}, user)
      this.data.username = user.username
      this.data.email = user.email

      this.findByEmailOrUsername((err, found) => {
        if (err) return Logger.error(err), done(err)
        if (found && found.id !== this.data.id) {
          return done(['conflict', 'Email Already Exists'])
        }

        this.data = Object.assign(user, this.data)

        if (this.data.password) {
          return hashPassword(this.data.password, (err, hashed) => {
            if (err) return Logger.error(err), done(err)
            this.data.password = hashed
            return this.update(done)
          })
        }
        return this.update(done)
      })
    })
  }

})

module.exports = User
