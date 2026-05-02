const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    const existing = await db.get_p('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone || '']);
    if (existing) return res.status(400).json({ error: 'Email or phone already registered.' });
    const hashed = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    await db.run_p('INSERT INTO users (id,name,email,phone,password) VALUES (?,?,?,?,?)', [id, name, email, phone || null, hashed]);
    const token = jwt.sign({ id, name, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, phone, role: 'user' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;
    if (!identifier || !password) return res.status(400).json({ error: 'Email/phone and password required.' });
    const user = await db.get_p('SELECT * FROM users WHERE email = ? OR phone = ?', [identifier, identifier]);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email:
