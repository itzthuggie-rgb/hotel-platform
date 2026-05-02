const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add review
router.post('/', auth, (req, res) => {
  const { hotel_id, booking_id, rating, comment } = req.body;
  if (!hotel_id || !rating) return res.status(400).json({ error: 'Hotel and rating are required.' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5.' });

  const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND hotel_id = ?').get(req.user.id, hotel_id);
  if (existing) return res.status(400).json({ error: 'You have already reviewed this hotel.' });

  const id = uuidv4();
  db.prepare('INSERT INTO reviews (id, user_id, hotel_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, hotel_id, booking_id || null, rating, comment || null);

  // Update hotel rating
  const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE hotel_id = ?').get(hotel_id);
  db.prepare('UPDATE hotels SET rating = ?, total_reviews = ? WHERE id = ?').run(Math.round(stats.avg * 10) / 10, stats.count, hotel_id);

  res.status(201).json({ message: 'Review added.', id });
});

// Get reviews for hotel
router.get('/hotel/:hotel_id', (req, res) => {
  const reviews = db.prepare(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.hotel_id = ? ORDER BY r.created_at DESC`).all(req.params.hotel_id);
  res.json(reviews);
});

module.exports = router;
