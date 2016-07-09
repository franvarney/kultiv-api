const Joi = require('joi')

const AuthModel = Joi.object().keys({
  hawk_id: Joi.string().guid(),
  hawk_key: Joi.string().guid()
})

module.exports = AuthModel
