require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Init DB
initDatabase();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));

// Admin stats
const { db } = require('./config/database');
const { auth, adminOnly } = require('./middleware/auth');

app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const totalHotels = db.prepare('SELECT COUNT(*) as count FROM hotels').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').get().count;
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const totalRevenue = db.prepare('SELECT SUM(total_price) as sum FROM bookings WHERE status != "cancelled"').get().sum || 0;
  const recentBookings = db.prepare(`SELECT b.*, h.name as hotel_name, u.name as user_name FROM bookings b JOIN hotels h ON b.hotel_id = h.id JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC LIMIT 5`).all();
  res.json({ totalHotels, totalUsers, totalBookings, totalRevenue, recentBookings });
});

// Users list (admin)
app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.get('/', (req, res) => res.json({ message: 'Hotel Platform API running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
