const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { hotel_id, check_in, check_out, guests, rooms, special_requests } = req.body;
    if (!hotel_id || !check_in || !check_out) return res.status(400).json({ error: 'Hotel, check-in and check-out required.' });
    const hotel = await db.get_p('SELECT * FROM hotels WHERE id = ?', [hotel_id]);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found.' });
    const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / 86400000);
    if (nights <= 0) return res.status(400).json({ error: 'Invalid dates.' });
    const total_price = hotel.price_per_night * nights * (rooms || 1);
    const id = uuidv4();
    await db.run_p('INSERT INTO bookings (id,user_id,hotel_id,check_in,check_out,guests,rooms,total_price,special_requests) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, req.user.id, hotel_id, check_in, check_out, guests||1, rooms||1, total_price, special_requests||null]);
    res.status(201).json({ message: 'Booking created.', id, total_price, nights });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await db.all_p('SELECT b.*,h.name as hotel_name,h.city,h.images,h.price_per_night FROM bookings b JOIN hotels h ON b.hotel_id=h.id WHERE b.user_id=? ORDER BY b.created_at DESC', [req.user.id]);
    res.json(bookings.map(b => ({ ...b, images: JSON.parse(b.images||'[]') })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await db.get_p('SELECT b.*,h.name as hotel_name,h.city,h.country,h.location,h.images,h.amenities FROM bookings b JOIN hotels h ON b.hotel_id=h.id WHERE b.id=?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied.' });
    res.json({ ...booking, images: JSON.parse(booking.images||'[]'), amenities: JSON.parse(booking.amenities||'[]') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await db.get_p('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied.' });
    await db.run_p("UPDATE bookings SET status='cancelled' WHERE id=?", [req.params.id]);
    res.json({ message: 'Booking cancelled.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const bookings = await db.all_p('SELECT b.*,h.name as hotel_name,u.name as user_name,u.email FROM bookings b JOIN hotels h ON b.hotel_id=h.id JOIN users u ON b.user_id=u.id ORDER BY b.created_at DESC');
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    await db.run_p('UPDATE bookings SET status=?,payment_status=? WHERE id=?', [status, payment_status, req.params.id]);
    res.json({ message: 'Booking updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
