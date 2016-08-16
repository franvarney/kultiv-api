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

    this.findByEmailOrUsername((err, user) => {
      if (err) return Logger.error(err), done(err)
      if (user) return done(['conflict', 'User Already Exists'])

      this.data.password = hashPassword(this.data.password)

      this.validate((err, validated) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }

        this.knex(this.name)
          .insert(validated)
          .transacting(this.trx)
          .returning(returning)
          .asCallback((err, created) => {
            if (err) {
              if (this.trx) {
                Logger.error('Transaction Failed'), this.trx.rollback()
              }
              return Logger.error(err), done(err)
            }

            if (this.trx && this.willCommit) {
              Logger.debug('Transaction Completed'), this.trx.commit()
            }


            if (!Array.isArray(this.data)) created = created[0]
            return done(null, created)
          })
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

  update (returning = 'id', done) {
    Logger.debug('user.update')

    if (!done) {
      done = returning
      returning = 'id'
    }

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
          this.data.password = hashPassword(this.data.password)
        }

        // TODO review why this is needed
        let id = this.data.id
        delete this.data.id
        delete this.data.created_at
        delete this.data.updated_at

        this.validate((err, validated) => {
          if (err) return Logger.error(err), done(err)

          delete validated.email

          this.knex(this.name)
            .update(validated)
            .where('id', id)
            .transacting(this.trx)
            .returning(returning)
            .asCallback((err, resource) => {
              if (err) {
                if (this.trx) {
                  Logger.error('Transaction Failed'), this.trx.rollback()
                }
                return Logger.error(err), done(err)
              }

              if (this.trx && this.willCommit) {
                Logger.debug('Transaction Completed'), this.trx.commit()
              }
              return done(null, resource[0])
            })
        })
      })
    })
  }
})

module.exports = User
