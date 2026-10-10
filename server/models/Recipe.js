const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 1000 },
    ingredients: { type: [String], validate: (v) => v.length > 0 },
    instructions: { type: [String], validate: (v) => v.length > 0 },
    category: { type: String, default: 'Other', trim: true },
    cuisine: { type: String, default: 'Other', trim: true },
    imageUrl: { type: String, default: '' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: { type: [ratingSchema], default: [] },
  },
  { timestamps: true }
);

recipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
