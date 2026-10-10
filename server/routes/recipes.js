const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const Favorite = require('../models/Favorite');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toList = (v) =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean)
    : String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);

// Adds averageRating / ratingCount and hides the raw ratings array
function present(recipe, userId) {
  const r = recipe.toObject ? recipe.toObject() : recipe;
  const count = r.ratings?.length || 0;
  const avg = count ? r.ratings.reduce((s, x) => s + x.value, 0) / count : 0;
  const mine = userId ? r.ratings?.find((x) => String(x.userId) === String(userId)) : null;
  delete r.ratings;
  return { ...r, averageRating: Math.round(avg * 10) / 10, ratingCount: count, myRating: mine ? mine.value : 0 };
}

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Invalid recipe id' });

// List + search + filter:  /api/recipes?search=&category=&cuisine=&mine=true
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category, cuisine, author } = req.query;
    const filter = {};
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (cuisine) filter.cuisine = new RegExp(`^${escapeRegex(cuisine)}$`, 'i');
    if (author && mongoose.isValidObjectId(author)) filter.authorId = author;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { ingredients: rx }];
    }
    const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).populate('authorId', 'name profileImage');
    res.json(recipes.map((r) => present(r, req.userId)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', validId, optionalAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('authorId', 'name profileImage');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const out = present(recipe, req.userId);
    out.isFavorite = req.userId
      ? !!(await Favorite.exists({ userId: req.userId, recipeId: recipe._id }))
      : false;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, cuisine, imageUrl } = req.body;
    const ingredients = toList(req.body.ingredients);
    const instructions = toList(req.body.instructions);
    if (!title || !ingredients.length || !instructions.length)
      return res.status(400).json({ message: 'Title, ingredients and instructions are required' });
    const recipe = await Recipe.create({
      title, description, ingredients, instructions, category, cuisine, imageUrl, authorId: req.userId,
    });
    res.status(201).json(present(recipe, req.userId));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', validId, auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (String(recipe.authorId) !== String(req.userId))
      return res.status(403).json({ message: 'Only the author can edit this recipe' });

    const { title, description, category, cuisine, imageUrl } = req.body;
    if (title !== undefined) recipe.title = title;
    if (description !== undefined) recipe.description = description;
    if (category !== undefined) recipe.category = category;
    if (cuisine !== undefined) recipe.cuisine = cuisine;
    if (imageUrl !== undefined) recipe.imageUrl = imageUrl;
    if (req.body.ingredients !== undefined) recipe.ingredients = toList(req.body.ingredients);
    if (req.body.instructions !== undefined) recipe.instructions = toList(req.body.instructions);
    await recipe.save();
    res.json(present(recipe, req.userId));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', validId, auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (String(recipe.authorId) !== String(req.userId))
      return res.status(403).json({ message: 'Only the author can delete this recipe' });
    await Promise.all([
      recipe.deleteOne(),
      Comment.deleteMany({ recipeId: recipe._id }),
      Favorite.deleteMany({ recipeId: recipe._id }),
    ]);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate a recipe (1-5); one rating per user, re-rating updates it
router.post('/:id/rate', validId, auth, async (req, res) => {
  try {
    const value = Number(req.body.value);
    if (!Number.isInteger(value) || value < 1 || value > 5)
      return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const existing = recipe.ratings.find((r) => String(r.userId) === String(req.userId));
    if (existing) existing.value = value;
    else recipe.ratings.push({ userId: req.userId, value });
    await recipe.save();
    res.json(present(recipe, req.userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle favorite
router.post('/:id/favorite', validId, auth, async (req, res) => {
  try {
    if (!(await Recipe.exists({ _id: req.params.id })))
      return res.status(404).json({ message: 'Recipe not found' });
    const key = { userId: req.userId, recipeId: req.params.id };
    const existing = await Favorite.findOne(key);
    if (existing) {
      await existing.deleteOne();
      return res.json({ isFavorite: false });
    }
    await Favorite.create(key);
    res.json({ isFavorite: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comments
router.get('/:id/comments', validId, async (req, res) => {
  try {
    const comments = await Comment.find({ recipeId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name profileImage');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', validId, auth, async (req, res) => {
  try {
    const text = (req.body.comment || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });
    if (!(await Recipe.exists({ _id: req.params.id })))
      return res.status(404).json({ message: 'Recipe not found' });
    const created = await Comment.create({ recipeId: req.params.id, userId: req.userId, comment: text });
    res.status(201).json(await created.populate('userId', 'name profileImage'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
