const mongoose = require('mongoose');

const ArticleInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  liked: { type: Boolean, default: false }, 
  viewed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ArticleInteraction', ArticleInteractionSchema);
