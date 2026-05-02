require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase } = require('./config/database');
const { auth, adminOnly } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

initDatabase().then(() => {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/hotels', require('./routes/hotels'));
  app.use('/api/bookings', require('./routes/bookings'));
  app.use('/api/reviews', require('./routes/reviews'));

  app.get('/api/admin/stats', auth, adminOnly, async (req, res) => {
    try {
      const totalHotels = (await db.get_p('SELECT COUNT(*) as c FROM hotels')).c;
      const totalUsers = (await db.get_p('SELECT COUNT(*) as c FROM users WHERE role="user"')).c;
      const totalBookings = (await db.get_p('SELECT COUNT(*) as c FROM bookings')).c;
      const rev = await db.get_p('SELECT SUM(total_price) as s FROM bookings WHERE status != "cancelled"');
      const totalRevenue = rev.s || 0;
      const recentBookings = await db.all_p('SELECT b.*,h.name as hotel_name,u.name as user_name FROM bookings b JOIN hotels h ON b.hotel_id=h.id JOIN users u ON b.user_id=u.id ORDER BY b.created_at DESC LIMIT 5');
      res.json({ totalHotels, totalUsers, totalBookings, totalRevenue, recentBookings });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
    try {
      const users = await db.all_p('SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC');
      res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/', (req, res) => res.json({ message: 'Hotel Platform API running ✅' }));

  const PORT
