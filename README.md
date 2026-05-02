# 🏨 HotelLink — Hotel Booking Platform

A full-stack hotel booking platform built with **Node.js + Express** (backend) and **React** (frontend), with a **SQLite** database. You own 100% of this code.

---

## 📁 Project Structure

```
hotel-platform/
├── backend/
│   ├── config/database.js     # DB init + seeding
│   ├── middleware/auth.js      # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js            # Login, register, profile
│   │   ├── hotels.js          # CRUD hotels
│   │   ├── bookings.js        # Booking management
│   │   └── reviews.js         # Hotel reviews
│   ├── server.js              # Main Express server
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── context/AuthContext.js
│       ├── components/
│       │   ├── Navbar.js
│       │   └── HotelCard.js
│       ├── pages/
│       │   ├── Home.js         # Landing page
│       │   ├── Hotels.js       # Browse + filter hotels
│       │   ├── HotelDetail.js  # Hotel info + booking
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js    # User bookings
│       │   └── AdminPanel.js   # Full admin control
│       ├── App.js
│       └── App.css
└── package.json
```

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
JWT_SECRET=change_this_to_a_long_random_secret
NODE_ENV=development
```

### 3. Start the Backend

```bash
cd backend
npm run dev     # Development (auto-restart)
# OR
npm start       # Production
```

The API will run on **http://localhost:5000**
The SQLite database (`hotel.db`) is created automatically on first run.

### 4. Start the Frontend

```bash
cd frontend
npm start
```

The React app will run on **http://localhost:3000**

---

## 🔐 Default Admin Account

| Field    | Value                   |
|----------|-------------------------|
| Email    | admin@hotellink.com     |
| Password | admin123                |

> ⚠️ Change the admin password immediately in production!

---

## ✨ Features

### Guest / User
- Browse and search hotels by city, category, price
- View hotel details, amenities, and reviews
- Register and login with email or phone
- Book hotels with check-in/check-out dates
- View and cancel bookings in dashboard
- Leave reviews after stays

### Admin Panel
- Dashboard with revenue, booking, user stats
- Add / delete hotels with full details
- View and manage all bookings (confirm/cancel)
- Mark payments as paid
- View all registered users

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint         | Description       |
|--------|-----------------|-------------------|
| POST   | /api/auth/register | Create account |
| POST   | /api/auth/login    | Login           |
| GET    | /api/auth/me       | Get profile     |
| PUT    | /api/auth/me       | Update profile  |

### Hotels
| Method | Endpoint           | Description         |
|--------|-------------------|---------------------|
| GET    | /api/hotels        | List/filter hotels  |
| GET    | /api/hotels/:id    | Hotel details       |
| POST   | /api/hotels        | Add hotel (admin)   |
| PUT    | /api/hotels/:id    | Update hotel (admin)|
| DELETE | /api/hotels/:id    | Delete hotel (admin)|

### Bookings
| Method | Endpoint                  | Description            |
|--------|--------------------------|------------------------|
| POST   | /api/bookings             | Create booking         |
| GET    | /api/bookings/my          | My bookings            |
| GET    | /api/bookings/:id         | Booking detail         |
| PUT    | /api/bookings/:id/cancel  | Cancel booking         |
| GET    | /api/bookings             | All bookings (admin)   |
| PUT    | /api/bookings/:id/status  | Update status (admin)  |

### Admin
| Method | Endpoint         | Description   |
|--------|-----------------|---------------|
| GET    | /api/admin/stats | Platform stats |
| GET    | /api/admin/users | All users     |

---

## 🚢 Deploying to Production

### Backend (e.g. Railway, Render, VPS)
1. Set `NODE_ENV=production` in environment variables
2. Set a strong `JWT_SECRET`
3. Run `npm start`

### Frontend (e.g. Vercel, Netlify)
1. Update `proxy` in `frontend/package.json` to your backend URL, OR
2. Set `REACT_APP_API_URL=https://your-backend.com` and update axios base URL
3. Run `npm run build` and deploy the `build/` folder

### SQLite → PostgreSQL/MySQL
For production with multiple users, migrate to PostgreSQL:
- Install `pg` and replace `better-sqlite3`
- Use connection pooling
- Run on managed DB (Railway PostgreSQL, Supabase, PlanetScale)

---

## 🛠 Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 18, React Router 6    |
| Backend    | Node.js, Express 4          |
| Database   | SQLite (better-sqlite3)     |
| Auth       | JWT + bcryptjs              |
| Styling    | Custom CSS, Google Fonts    |

---

Built with ❤️ — You own this code completely.
