const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { city, category, min_price, max_price, search, sort } = req.query;
    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];
    if (city) { query += ' AND city LIKE ?'; params.push(`%${city}%`); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (min_price) { query += ' AND price_per_night >= ?'; params.push(Number(min_price)); }
    if (max_price) { query += ' AND price_per_night <= ?'; params.push(Number(max_price)); }
    if (search) { query += ' AND (name LIKE ? OR city LIKE ? OR description LIKE ?)'; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    if (sort === 'price_asc') query += ' ORDER BY price_per_night ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price_per_night DESC';
    else query += ' ORDER BY rating DESC';
    const hotels = await db.all_p(query, params);
    res.json(hotels.map(h => ({ ...h, amenities: JSON.parse(h.amenities||'[]'), images: JSON.parse(h.images||'[]') })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const hotel = await db.get_p('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found.' });
    const reviews = await db.all_p('SELECT r.*,u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.hotel_id=? ORDER BY r.created_at DESC LIMIT 10', [req.params.id]);
    res.json({ ...hotel, amenities: JSON.parse(hotel.amenities||'[]'), images: JSON.parse(hotel.images||'[]'), reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, location, city, country, price_per_night, amenities, images, available_rooms, category } = req.body;
    if (!name || !city || !country || !price_per_night) return res.status(400).json({ error: 'Required fields missing.' });
    const id = uuidv4();
    await db.run_p('INSERT INTO hotels (id,name,description,location,city,country,price_per_night,amenities,images,available_rooms,category) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, name, description, location, city, country, price_per_night, JSON.stringify(amenities||[]), JSON.stringify(images||[]), available_rooms||10, category||'standard']);
    res.status(201).json({ message: 'Hotel created.', id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, location, city, country, price_per_night, amenities, images, available_rooms, category } = req.body;
    await db.run_p('UPDATE hotels SET name=?,description=?,location=?,city=?,country=?,price_per_night=?,amenities=?,images=?,available_rooms=?,category=? WHERE id=?',
      [name, description, location, city, country, price_per_night, JSON.stringify(amenities||[]), JSON.stringify(images||[]), available_rooms, category, req.params.id]);
    res.json({ message: 'Hotel updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run_p('DELETE FROM hotels WHERE id = ?', [req.params.id]);
    res.json({ message: 'Hotel deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
