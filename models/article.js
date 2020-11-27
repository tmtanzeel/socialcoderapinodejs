const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const articleSchema = new Schema({
  articleid: String,
  title: String,
  content: String,
  date: String,
  contributor: String,
  upvotes: Number,
  upvoters: [String],
  downvotes: Number,
  downvoters: [String]
})
module.exports = mongoose.model('article', articleSchema, 'articles');