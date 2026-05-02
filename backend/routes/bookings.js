const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', auth, (req, res) => {
  const { hotel_id, check_in, check_out, guests, rooms, special_requests } = req.body;
  if (!hotel_id || !check_in || !check_out) return res.status(400).json({ error: 'Hotel, check-in and check-out are required.' });

  const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(hotel_id);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found.' });

  const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) return res.status(400).json({ error: 'Invalid dates.' });

  const total_price = hotel.price_per_night * nights * (rooms || 1);
  const id = uuidv4();

  db.prepare(`INSERT INTO bookings (id, user_id, hotel_id, check_in, check_out, guests, rooms, total_price, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.user.id, hotel_id, check_in, check_out, guests || 1, rooms || 1, total_price, special_requests || null);

  res.status(201).json({ message: 'Booking created.', id, total_price, nights });
});

// Get my bookings
router.get('/my', auth, (req, res) => {
  const bookings = db.prepare(`SELECT b.*, h.name as hotel_name, h.city, h.images, h.price_per_night FROM bookings b JOIN hotels h ON b.hotel_id = h.id WHERE b.user_id = ? ORDER BY b.created_at DESC`).all(req.user.id);
  res.json(bookings.map(b => ({ ...b, images: JSON.parse(b.images || '[]') })));
});

// Get single booking
router.get('/:id', auth, (req, res) => {
  const booking = db.prepare(`SELECT b.*, h.name as hotel_name, h.city, h.country, h.location, h.images, h.amenities FROM bookings b JOIN hotels h ON b.hotel_id = h.id WHERE b.id = ?`).get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied.' });
  res.json({ ...booking, images: JSON.parse(booking.images || '[]'), amenities: JSON.parse(booking.amenities || '[]') });
});

// Cancel booking
router.put('/:id/cancel', auth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied.' });
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Booking cancelled.' });
});

// Admin: get all bookings
router.get('/', auth, adminOnly, (req, res) => {
  const bookings = db.prepare(`SELECT b.*, h.name as hotel_name, u.name as user_name, u.email FROM bookings b JOIN hotels h ON b.hotel_id = h.id JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC`).all();
  res.json(bookings);
});

// Admin: update booking status
router.put('/:id/status', auth, adminOnly, (req, res) => {
  const { status, payment_status } = req.body;
  db.prepare('UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?').run(status, payment_status, req.params.id);
  res.json({ message: 'Booking updated.' });
});

module.exports = router;
