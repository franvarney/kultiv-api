const Parallel = require('run-parallel')

function split(text) {
  if (text.indexOf('\n') > - 1) {
    text += '\n'
  }

  return text.split(/\n/g)
}

function decimal(numerator, denominator) {
  return numerator / denominator
}

function parseIngredients(ingredients, done) {
  if (!ingredients) {
    return done('No Ingredients')
  }

  ingredients = split(ingredients)

  let newIngredients = []
  ingredients.some((ingredient) => {
    if (!ingredient) return

    let create = new Array(4)

    // check if optional first. if so, remove the optional string
    let index = ingredient.indexOf('optional')
    if (index > -1) {
      create[3] = true
      ingredient = ingredient.slice(0, index - 2) // -2 removes ', ' then 'optional'
    } else create[3] = false

    // split string on space
    ingredient = ingredient.split(' ')

    // check if index 0 is a number or 'a' which would mean '1'. if so, set
    // index 0 equal to the number
    if (ingredient[0].indexOf('/') > -1) {
      let [numerator, denominator] = ingredient.shift().split('/')
      create[0] = decimal(numerator, denominator)
    } else if (!isNaN(Number(ingredient[0]))) {
      create[0] = Number(ingredient.shift())
    } else if (ingredient[0].toLowerCase() === 'a' ||
               ingredient[0].toLowerCase() === 'an') {
      ingredient.shift()
      create[0] = 1
    } else create[0] = null

    // if there's not two values left, that probably means there is no unit
    if (!ingredient[1]) {
      create[1] = null
      create[2] = ingredient.shift()
    } else {
      // check for fractions in index 1
      if (ingredient[0].indexOf('/') > -1) {
        let [numerator, denominator] = ingredient.shift().split('/')
        create[0] = create[0] + decimal(numerator, denominator)
      }

      create[1] = ingredient.shift()
      create[2] = ingredient.join(' ')

      // if the food starts with of, remove it
      if (create[2].indexOf('of') === 0) {
        create[2] = create[2].substring(3)
      }

      // if the food starts with and, then add index 1 to index 2 and reset index 1
      if (create[2].indexOf('and') === 0) {
        create[2] = `${create[1]} ${create[2]}`
        create[1] = null
       }
    }

    newIngredients.push({
      amount: create[0],
      unit: create[1],
      food: create[2],
      optional: create[3]
    })
  })

  return done(null, newIngredients)
}

function parseDirections(directions, done) {
  if (!directions) {
    return done('No Directions')
  }

  directions = split(directions)
  directions = directions.filter((direction) => !!direction)
  directions = directions.map((direction, i) => ({ direction, order: i + 1 }))

  return done(null, directions)
}

module.exports = function (payload, done) {
  let {ingredients, directions} = payload

  Parallel([
    parseIngredients.bind(null, ingredients),
    parseDirections.bind(null, directions)
  ], (err, parsed) => {
    if (err) return done(err)

    payload.ingredients = parsed[0]
    payload.directions = parsed[1]
    return done(null, payload)
  })
}
