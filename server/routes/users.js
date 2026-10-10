const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Current user's saved recipes (must be declared before "/:id")
router.get('/me/favorites', auth, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.userId }).sort({ createdAt: -1 }).populate({
      path: 'recipeId',
      populate: { path: 'authorId', select: 'name profileImage' },
    });
    const recipes = favs
      .map((f) => f.recipeId)
      .filter(Boolean)
      .map((r) => {
        const o = r.toObject();
        const count = o.ratings?.length || 0;
        o.averageRating = count ? Math.round((o.ratings.reduce((s, x) => s + x.value, 0) / count) * 10) / 10 : 0;
        o.ratingCount = count;
        delete o.ratings;
        return o;
      });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user id' });
    const user = await User.findById(req.params.id).select('name profileImage createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const recipeCount = await Recipe.countDocuments({ authorId: user._id });
    res.json({ ...user.toObject(), recipeCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (req.params.id !== String(req.userId))
      return res.status(403).json({ message: 'You can only update your own profile' });
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.profileImage !== undefined) updates.profileImage = req.body.profileImage;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json({ _id: user._id, name: user.name, email: user.email, profileImage: user.profileImage });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
