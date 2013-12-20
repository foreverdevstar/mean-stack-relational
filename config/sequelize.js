var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize-sqlite').sequelize;
var _         = require('lodash');
var config    = require('./config');
var db        = {};


console.log('Initializing Sequelize');

// create your instance of sequelize
var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
  dialect: 'sqlite',
  storage: config.db.storage
});

// loop through all files ignoring hidden files and this file
fs.readdirSync(config.modelsDir)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  // import model files and save model names
  .forEach(function(file) {
    console.log('Loading model file ' + file);
    var model = sequelize.import(path.join(config.modelsDir, file));
    db[model.name] = model;
  })

// invoke associations on each of the models
Object.keys(db).forEach(function(modelName) {
  if (db[modelName].options.hasOwnProperty('associate')) {
    db[modelName].options.associate(db)
  }
});

db.User.create({username: 'jpotts18'}).success(function(user){
  console.log(user.values);
});

// Synchronizing any model changes with database. 
// WARNING: this will DROP your database everytime you re-run your application
sequelize
  .sync({force: true})
  .complete(function(err){
    if(err) console.log("An error occured %j",err);
    else console.log("Database Dropped and Synchronized");
});
 
// assign the sequelize variables to the db object and returning the db. 
module.exports = _.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);