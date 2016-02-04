'use strict';

const CookbookModel = require('../models/cookbook');
const DB = require('../connections/postgres');
const Base = require('base.js');

class Cookbook extends Base {

  constructor() {
    super('cookbooks', CookbookModel);
  }

  //GET
  findByOwner(ownerUserId){
    //DB->where id == userId
  }

  findByCollaborator(collaboratorUserId){
   DB("cookbook").innerJoin("cookbooks-collaborators as cc", "id", "cc.id")
           .where("cc.user_id", collaboratorUserId)
           .then(function(err,cookbooks){
              //
            })
           .catch(function(err){
              console.log(err);
            });
  }

  //POST
  create(cookbook){
    //DB->insert.....
  }

  //PUT
  update(id, cookbook){
    //DB->update.....
  }

  //PATCH
  toggleIsPrivate(id){
    //DB->isPrivate = !isPrivate
  }

}

module.exports = new Cookbook();
