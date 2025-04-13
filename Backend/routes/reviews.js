const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// Get reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email');

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    res.json({
      reviews,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Submit a new review
router.post('/', async (req, res) => {
  try {
    const { productId, userId, rating, comment, userType } = req.body;

    // Validate required fields
    if (!productId || !userId || !rating || !comment || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new review
    const review = new Review({
      productId,
      userId,
      userName: user.name,
      userType,
      rating,
      comment,
      verified: userType === 'admin' // Auto-verify admin reviews
    });

    await review.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// Update review verification status (admin only)
router.patch('/:reviewId/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { verified },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      message: 'Review verification status updated',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

module.exports = router; 