const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const discussionSchema = new Schema({
  qtitle: String,
  qcontent: String,
  date: String,
  askedby: String,
  answers: [String],
  tags: {
    
  }
})

module.exports = mongoose.model('discussion', discussionSchema, 'discussions');
