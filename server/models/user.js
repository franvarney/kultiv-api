const Bcrypt = require('bcryptjs')
const Logger = require('franston')('server:models:user')

const Model = require('./base')
const UserSchema = require('../schemas/user')

const TABLE_NAME = 'users'
const SALT_WORK_FACTOR = 10

function hashPassword (password) {
  let salt = Bcrypt.genSaltSync(SALT_WORK_FACTOR)
  return Bcrypt.hashSync(password, salt)
}

const User = Model.createModel({
  name: TABLE_NAME,
  schema: UserSchema.general,

  create (returning = 'id', done) {
    Logger.debug('user.create')

    if (!done) {
      done = returning
      returning = 'id'
    }

    this.data.password = hashPassword(this.data.password)
    return this._create(done)
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

  findById (done) {
    Logger.debug('user.findById')

    this
      .setSelect('users.id', 'users.username', 'users.email',
                 'users.first_name','users.last_name',
                 'users.location', 'users.is_admin',
                 'users.created_at', 'users.updated_at')
      ._findById((err, user) => {
        if (err) return this._errors(err, done)
        return done(null, user)
      })
  },

  update (returning = 'id', done) {
    Logger.debug('user.update')

    if (!done) {
      done = returning
      returning = 'id'
    }

    if (this.data.password) {
      this.data.password = hashPassword(this.data.password)
    }

    return this._update(done)
  }
})

module.exports = User
