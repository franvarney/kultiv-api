const IsEqual = require('lodash.isequal')
const Logger = require('franston')('server:models:ingredient')
const Parallel = require('run-parallel')
const XorWith = require('lodash.xorwith')
const Waterfall = require('run-waterfall')

const Base = require('./base')
const FoodModel = require('./food')
const IngredientSchema = require('../schemas/ingredient')
const UnitModel = require('./unit')

const TABLE_NAME = 'ingredients'

class Ingredient extends Base {
  constructor (data) {
    super(TABLE_NAME, IngredientSchema.general, data)
  }

  get Food () {
    return FoodModel
  }

  get Unit () {
    return UnitModel
  }

  findOrCreate(done) {
    Logger.debug('ingredient.findOrCreate')

    let {food, unit} = this.payload

    const Food = new this.Food({ payload: { name: food } })
    const Unit = new this.Unit({ payload: { name: unit } })

    Parallel([
      Food.findOrCreate.bind(Food),
      Unit.findOrCreate.bind(Unit)
    ], (err, results) => {
      if (err) {
        if (this._rollback()) this._trxRollback()
        return this._errors(err, done)
      }

      delete this.payload.food
      delete this.payload.unit

      this.payload.food_id = results[0]
      this.payload.unit_id = results[1]

      this.knex(this.name)
        .select('id')
        .where(this.payload)
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

          return super.create(done)
        })
    })
  }

  batchFindOrCreate(done) {
    Logger.debug('ingredient.batchFindOrCreate')

    let {payload} = this
    let foods = []
    let units = []

    payload.forEach((ingredient) => foods.push({ name: ingredient.food }))
    payload.forEach((ingredient) => units.push({ name: ingredient.unit }))

    const Food = new this.Food({
      payload: foods
    })

    const Unit = new this.Unit({
      payload: units
    })

    // TODO trx?
    Parallel([
      Food.batchFindOrCreate.bind(Food),
      Unit.batchFindOrCreate.bind(Unit)
    ], (err, results) => {
      if (err) {
        if (this._rollback()) this._trxRollback()
        return this._errors(err, done)
      }

      const Food = new this.Food({ payload: results[0] })
      const Unit = new this.Unit({ payload: results[1] })

      let foodMap = new Map()
      let unitMap = new Map()

      Parallel([
        function (callback) {
          Food.findById(false, (err, foods) => {
            if (err) return callback(err)

            foods.forEach((food) => {
              foodMap.has(food.name) || foodMap.set(food.name, food.id)
            })

            return callback()
          })
        },
        function (callback) {
          Unit.findById(false, (err, units) => {
            if (err) return callback(err)

            units.forEach((unit) => {
              unitMap.has(unit.name) || unitMap.set(unit.name, unit.id)
            })

            return callback()
          })
        },
      ], (err) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        payload.forEach((ingredient) => {
          ingredient.food_id = foodMap.get(ingredient.food)
          delete ingredient.food
          ingredient.unit_id = unitMap.get(ingredient.unit)
          delete ingredient.unit
          ingredient.optional = ingredient.optional || false
        })

        this.knex(this.name)
          .select('id', 'amount', 'unit_id', 'food_id', 'optional')
          .where(function () {
            payload.forEach((ingredient) => this.orWhere(ingredient))
          })
          .transacting(this.trx)
          .asCallback((err, found) => {
            if (err) {
              if (this._rollback()) this._trxRollback()
              return this._errors(err, done)
            }

            let ids = []
            let create = XorWith(payload, found.map((ingredient) => {
              ids.push(ingredient.id)
              delete ingredient.id
              ingredient.amount = Number(ingredient.amount)
              return ingredient
            }), IsEqual)

            if (!create || !create.length) {
              if (this._commit()) this._trxComplete()
              return done(null, ids)
            }

            this.payload = create

            this.create((err, created) => {
              if (err) return this._errors(err, done)
              return done(null, created.concat(ids))
            })
          })
      })
    })
  }
}

module.exports = Ingredient
