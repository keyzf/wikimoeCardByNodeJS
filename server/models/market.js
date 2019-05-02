var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;
// Schema
var market = new Schema({
  email:String,
  selled:{type: Boolean, default: false},
  cardId:{type: Number, default: 0},
  price:{type: Number, default: 30},
  time:{type: SchemaTypes.Long, default: 0},
});

module.exports = mongoose.model('market', market);