const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }, // Indicates if the notification has been read
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
