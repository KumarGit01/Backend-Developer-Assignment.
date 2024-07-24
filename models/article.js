const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, 
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);
