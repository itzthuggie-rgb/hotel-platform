const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all hotels with optional filters
router.get('/', (req, res) => {
  const { city, category, min_price, max_price, search, sort } = req.query;
  let query = 'SELECT * FROM hotels WHERE 1=1';
  const params = [];

  if (city) { query += ' AND city LIKE ?'; params.push(`%${city}%`); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (min_price) { query += ' AND price_per_night >= ?'; params.push(Number(min_price)); }
  if (max_price) { query += ' AND price_per_night <= ?'; params.push(Number(max_price)); }
  if (search) { query += ' AND (name LIKE ? OR city LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  if (sort === 'price_asc') query += ' ORDER BY price_per_night ASC';
  else if (sort === 'price_desc') query += ' ORDER BY price_per_night DESC';
  else if (sort === 'rating') query += ' ORDER BY rating DESC';
  else query += ' ORDER BY created_at DESC';

  const hotels = db.prepare(query).all(...params);
  res.json(hotels.map(h => ({ ...h, amenities: JSON.parse(h.amenities || '[]'), images: JSON.parse(h.images || '[]') })));
});

// Get single hotel
router.get('/:id', (req, res) => {
  const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(req.params.id);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found.' });
  const reviews = db.prepare(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.hotel_id = ? ORDER BY r.created_at DESC LIMIT 10`).all(req.params.id);
  res.json({ ...hotel, amenities: JSON.parse(hotel.amenities || '[]'), images: JSON.parse(hotel.images || '[]'), reviews });
});

// Create hotel (admin)
router.post('/', auth, adminOnly, (req, res) => {
  const { name, description, location, city, country, price_per_night, amenities, images, available_rooms, category } = req.body;
  if (!name || !city || !country || !price_per_night) return res.status(400).json({ error: 'Required fields missing.' });
  const id = uuidv4();
  db.prepare(`INSERT INTO hotels (id, name, description, location, city, country, price_per_night, amenities, images, available_rooms, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, description, location, city, country, price_per_night, JSON.stringify(amenities || []), JSON.stringify(images || []), available_rooms || 10, category || 'standard');
  res.status(201).json({ message: 'Hotel created.', id });
});

// Update hotel (admin)
router.put('/:id', auth, adminOnly, (req, res) => {
  const { name, description, location, city, country, price_per_night, amenities, images, available_rooms, category } = req.body;
  db.prepare(`UPDATE hotels SET name=?, description=?, location=?, city=?, country=?, price_per_night=?, amenities=?, images=?, available_rooms=?, category=? WHERE id=?`)
    .run(name, description, location, city, country, price_per_night, JSON.stringify(amenities || []), JSON.stringify(images || []), available_rooms, category, req.params.id);
  res.json({ message: 'Hotel updated.' });
});

// Delete hotel (admin)
router.delete('/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM hotels WHERE id = ?').run(req.params.id);
  res.json({ message: 'Hotel deleted.' });
});

module.exports = router;
