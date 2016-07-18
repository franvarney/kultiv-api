const RecipeModel = require('../../models/recipe')

module.exports = function (payload, done) {
  const Recipe = new RecipeModel()

  let query = `recipes.id = ${payload.recipe_id}`

  Recipe.loadRecipe(query, true, (err, recipes) => {
    if (err) return done(err)

    if (recipes.length) {
      // Reformat so it matches RecipeSchema.createPayload
      recipes.forEach((recipe) => {
        // set as fork
        recipe.source_type = 'fork'
        recipe.source_value = recipe.id

        // delete these properties as they will be set on creation
        delete recipe['creator:id']
        delete recipe['creator:username']

        // correct the format, want the user to be able to submit right away
        recipe.yield_amount = recipe['yields-:amount']
        recipe.yield_unit = recipe['yields-:unit']

        // delete unused
        delete recipe['yields-:amount']
        delete recipe['yields-:unit']
        delete recipe['ingredients:id']
        delete recipe['directions:id']

        // delete dates
        delete recipe.created_at
        delete recipe.updated_at
      })

      return done(null, recipes)
    }
  })

  return done(['notFound', 'Recipe Not Found'])
}
