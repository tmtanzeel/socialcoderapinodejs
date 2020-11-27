const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
  firstName: String,
  lastName: String, 
  email: String,
  password: String,
  userid: String
})

module.exports = mongoose.model('user', userSchema, 'users');
