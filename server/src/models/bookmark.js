const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
  favicon: { type: String, default: '' },
  viewCount: { type: Number, default: 0 },
  lastVisited: { type: Date, default: null },
  dateAdded: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);
