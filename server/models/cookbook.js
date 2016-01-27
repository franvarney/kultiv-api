var Cookbook;

const BaseModel = require('hapi-mongo-models').BaseModel;
// const Debug = require('debug')('cookbook/src/models/cookbook');
const Joi = require('joi');
const ObjectAssign = require('object-assign');
const ShortId32 = require('shortid32');

ShortId32.characters('23456789abcdefghjklmnpqrstuvwxyz');

Cookbook = BaseModel.extend({
  constructor: function (attrs) {
    ObjectAssign(this, attrs);
  }
});

Cookbook._collection = 'cookbooks'; // eslint-disable-line

Cookbook.schema = Joi.object().keys({
  _id: Joi.string().default(ShortId32.generate, 'Generate short id 32'),
  title: Joi.string().min(1).max(255),
  description: Joi.string().optional().allow('').trim(),
  userId: Joi.string().required(), // creator
  isPrivate: Joi.boolean().default(false),
  password: Joi.string().optional().regex(/[a-zA-Z0-9]{3,30}/),
  recipeIds: Joi.array().unique(),
  contributorIds: Joi.array().unique(),
  created: Joi.date().raw().default(Date.now, 'Created'),
  updated: Joi.date().raw(),
  deleted: Joi.date().raw()
});

Cookbook.indexes = [
  [{ _id: 1 }, { unique: true }],
  [{ title: 1 }, { unique: false }],
  [{ userId: 1 }, { unique: false }],
  [{ created: 1}, { unique: false }]
];

module.exports = Cookbook;
