const Logger = require('franston')('server:models:ingredient')
const Parallel = require('run-parallel')

const Model = require('./base')
const Food = require('./food')
const IngredientSchema = require('../schemas/ingredient')
const Lodash = require('../utils/lodash')
const Unit = require('./unit')

const TABLE_NAME = 'ingredients'

const Ingredient = Model.createModel({
  name: TABLE_NAME,
  schema: IngredientSchema.general,

  findOrCreate(done) {
    Logger.debug('ingredient.findOrCreate')

    let {food, unit} = this.data

    Parallel([
      Food.set({ name: food }).findOrCreate.bind(Food),
      Unit.set({ name: unit }).findOrCreate.bind(Unit)
    ], (err, results) => {
      if (err) {
        if (this._rollback()) this._trxRollback()
        return this._errors(err, done)
      }

      delete this.data.food
      delete this.data.unit

      this.data.food_id = results[0]
      this.data.unit_id = results[1]

      this.knex(this.name)
        .select('id')
        .where(this.data)
        .first()
        .transacting(this.trx)
        .asCallback((err, found) => {
          if (err) {
            if (this._rollback()) this._trxRollback()
            return this._errors(err, done)
          }

          if (found) {
            if (this._commit()) this._trxComplete()
            return done(null, found.id)
          }

          return this._create(done)
        })
    })
  },

  batchFindOrCreate(done) {
    Logger.debug('ingredient.batchFindOrCreate')

    let foods = []
    let units = []

    this.data.map((ingredient) => foods.push({ name: ingredient.food }))
    this.data.map((ingredient) => units.push({ name: ingredient.unit || 'none' }))

    // TODO trx?
    Parallel([
      Food.set(foods.filter((food) => true)).batchFindOrCreate.bind(Food),
      Unit.set(units.filter((unit) => true)).batchFindOrCreate.bind(Unit)
    ], (err, results) => {
      if (err) {
        if (this._rollback()) this._trxRollback()
        return this._errors(err, done)
      }

      let foodMap = new Map()
      let unitMap = new Map()

      Parallel([
        function (callback) {
          Food.set(results[0]).findById(false, (err, foods) => {
            if (err) return callback(err)

            foods.forEach((food) => foodMap.set(food.name, food.id))
            return callback()
          })
        },
        function (callback) {
          Unit.set(results[1]).findById(false, (err, units) => {
            if (err) return callback(err)

            units.forEach((unit) => unitMap.set(unit.name, unit.id))
            return callback()
          })
        },
      ], (err) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        let {data} = this

        data.forEach((ingredient) => {
          ingredient.food_id = foodMap.get(ingredient.food)
          delete ingredient.food
          ingredient.unit_id = unitMap.get(ingredient.unit || 'none')
          delete ingredient.unit
          ingredient.optional = ingredient.optional || false
        })

        this.knex(this.name)
          .select('id', 'amount', 'unit_id', 'food_id', 'optional')
          .where(function () {
            data.forEach((ingredient) => this.orWhere(ingredient))
          })
          .transacting(this.trx)
          .asCallback((err, found) => {
            if (err) {
              if (this._rollback()) this._trxRollback()
              return this._errors(err, done)
            }

            let ids = []
            let create = Lodash.xorWith(data, found.map((ingredient) => {
              ids.push(ingredient.id), delete ingredient.id
              ingredient.amount = Number(ingredient.amount)
              return ingredient
            }), Lodash.isEqual)

            if (!create.length) {
              if (this._commit()) this._trxComplete()
              return done(null, ids)
            }

            this.set(create)._create((err, created) => {
              if (err) return this._errors(err, done)
              return done(null, created.concat(ids))
            })
          })
      })
    })
  }
})

module.exports = Ingredient
