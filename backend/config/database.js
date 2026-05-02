const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '../hotel.db'));

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      amenities TEXT,
      images TEXT,
      available_rooms INTEGER DEFAULT 10,
      category TEXT DEFAULT 'standard',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hotel_id TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER DEFAULT 1,
      rooms INTEGER DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'unpaid',
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hotel_id TEXT NOT NULL,
      booking_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );
  `);

  // Seed admin user
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@hotellink.com');
  if (!adminExists) {
    const { v4: uuidv4 } = require('uuid');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(uuidv4(), 'Admin User', 'admin@hotellink.com', '0000000', hashedPassword, 'admin');
  }

  // Seed sample hotels
  const hotelCount = db.prepare('SELECT COUNT(*) as count FROM hotels').get();
  if (hotelCount.count === 0) {
    const { v4: uuidv4 } = require('uuid');
    const hotels = [
      {
        id: uuidv4(), name: 'Grand Palace Hotel', description: 'Luxury 5-star hotel in the heart of the city with world-class amenities.',
        location: '123 Main Street', city: 'New York', country: 'USA', price_per_night: 350,
        rating: 4.8, total_reviews: 320, amenities: JSON.stringify(['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']),
        available_rooms: 50, category: 'luxury'
      },
      {
        id: uuidv4(), name: 'Sunset Beach Resort', description: 'Beachfront resort with stunning ocean views and private beach access.',
        location: '456 Ocean Drive', city: 'Miami', country: 'USA', price_per_night: 280,
        rating: 4.6, total_reviews: 210, amenities: JSON.stringify(['WiFi', 'Pool', 'Beach Access', 'Water Sports', 'Restaurant']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800']),
        available_rooms: 35, category: 'resort'
      },
      {
        id: uuidv4(), name: 'City Center Inn', description: 'Affordable and comfortable hotel ideal for business travelers.',
        location: '789 Business Blvd', city: 'Chicago', country: 'USA', price_per_night: 120,
        rating: 4.2, total_reviews: 180, amenities: JSON.stringify(['WiFi', 'Gym', 'Business Center', 'Parking']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1551882547-ff40c4fe1fa7?w=800']),
        available_rooms: 80, category: 'business'
      },
      {
        id: uuidv4(), name: 'Mountain View Lodge', description: 'Cozy mountain retreat surrounded by nature and breathtaking scenery.',
        location: '10 Alpine Road', city: 'Denver', country: 'USA', price_per_night: 195,
        rating: 4.7, total_reviews: 150, amenities: JSON.stringify(['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant', 'Spa']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
        available_rooms: 20, category: 'resort'
      },
      {
        id: uuidv4(), name: 'The Boutique Hotel', description: 'Chic boutique hotel with unique rooms and personalized service.',
        location: '22 Art District', city: 'Los Angeles', country: 'USA', price_per_night: 220,
        rating: 4.5, total_reviews: 95, amenities: JSON.stringify(['WiFi', 'Bar', 'Rooftop Pool', 'Concierge']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800']),
        available_rooms: 15, category: 'boutique'
      },
      {
        id: uuidv4(), name: 'Harbor View Hotel', description: 'Classic waterfront hotel with panoramic harbor views.',
        location: '5 Harbor Lane', city: 'San Francisco', country: 'USA', price_per_night: 310,
        rating: 4.4, total_reviews: 270, amenities: JSON.stringify(['WiFi', 'Restaurant', 'Bar', 'Gym', 'Concierge']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800']),
        available_rooms: 40, category: 'luxury'
      }
    ];
    const insert = db.prepare(`INSERT INTO hotels (id, name, description, location, city, country, price_per_night, rating, total_reviews, amenities, images, available_rooms, category) VALUES (@id, @name, @description, @location, @city, @country, @price_per_night, @rating, @total_reviews, @amenities, @images, @available_rooms, @category)`);
    hotels.forEach(h => insert.run(h));
  }

  console.log('✅ Database initialized');
}

module.exports = { db, initDatabase };
