const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:user')

const Base = require('./base')
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

class User extends Base {
  constructor (data) {
    super(TABLE_NAME, UserSchema.general, data)
  }

  create (done) {
    Logger.debug('user.create')

    this.findByEmailOrUsername((err, user) => {
      if (err) return Logger.error(err), done(err)
      if (user) return done(['conflict', 'User Already Exists'])

      hashPassword(this.payload.password, (err, hashed) => {
        if (err) return Logger.error(err), done(err)
        this.payload.password = hashed
        super.create(done)
      })
    })
  }

  findByEmailOrUsername (done) {
    Logger.debug('user.findByEmailOrUsername')

    let {email=null, username=null} = this.payload

    this.knex(this.name)
      .select('id', 'username', 'email', 'password')
      .where('username', username)
      .orWhere('email', email)
      .whereNull('deleted_at')
      .first()
      .asCallback((err, user) => {
        if (err) return Logger.error(err), done(err)
        return done(null, user)
      })
  }

  update (done) {
    Logger.debug('user.update')

    this.findById((err, user) => {
      if (err) return Logger.error(err), done(err)

      this.payload = Object.assign(user, this.payload)

      this.findByEmailOrUsername((err, user) => {
        if (err) return Logger.error(err), done(err)
        if (user) return done(['conflict', 'Email Already Exists'])

        if (this.payload.password) {
          return hashPassword(this.payload.password, (err, hashed) => {
            if (err) return Logger.error(err), done(err)
            this.payload.password = hashed
            return super.update(done)
          })
        }

        return super.update(done)
      })
    })
  }
}

module.exports = User
