'use strict';

const Joi = require('joi');

const CookbookModel = require('../models/cookbook');
const Knex = require('../connections/postgres');

class Cookbook extends Base{
	
	constructor(){
		super("cookbook", CookbookModel);
	}

}

module.exports = new Cookbook()();