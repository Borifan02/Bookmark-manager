const express = require('express');
const router = express.Router();
const Bookmark = require('../models/bookmark');

// GET /r/:id -> increments viewCount + lastVisited then redirects to URL
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const bm = await Bookmark.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 }, $set: { lastVisited: new Date() } },
      { new: true }
    ).lean();
    if (!bm) return res.status(404).send('Not found');

    // ensure URL is absolute
    let target = bm.url;
    if (!/^https?:\/\//i.test(target)) target = 'http://' + target;

    return res.redirect(target);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
