const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(path.join(__dirname, '../hotel.db'));

db.run_p = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function(err) { if (err) rej(err); else res(this); }));
db.get_p = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (err, row) => { if (err) rej(err); else res(row); }));
db.all_p = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (err, rows) => { if (err) rej(err); else res(rows); }));

async function initDatabase() {
  await db.run_p(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT, password TEXT NOT NULL, role TEXT DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await db.run_p(`CREATE TABLE IF NOT EXISTS hotels (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, location TEXT NOT NULL, city TEXT NOT NULL, country TEXT NOT NULL, price_per_night REAL NOT NULL, rating REAL DEFAULT 0, total_reviews INTEGER DEFAULT 0, amenities TEXT, images TEXT, available_rooms INTEGER DEFAULT 10, category TEXT DEFAULT 'standard', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await db.run_p(`CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, hotel_id TEXT NOT NULL, check_in DATE NOT NULL, check_out DATE NOT NULL, guests INTEGER DEFAULT 1, rooms INTEGER DEFAULT 1, total_price REAL NOT NULL, status TEXT DEFAULT 'pending', payment_status TEXT DEFAULT 'unpaid', special_requests TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await db.run_p(`CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, hotel_id TEXT NOT NULL, booking_id TEXT, rating INTEGER NOT NULL, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  const admin = await db.get_p('SELECT id FROM users WHERE email = ?', ['admin@hotellink.com']);
  if (!admin) {
    const hashed = bcrypt.hashSync('admin123', 10);
    await db.run_p('INSERT INTO users (id,name,email,phone,password,role) VALUES (?,?,?,?,?,?)', [uuidv4(),'Admin User','admin@hotellink.com','0000000',hashed,'admin']);
  }

  const count = await db.get_p('SELECT COUNT(*) as c FROM hotels');
  if (count.c === 0) {
    const hotels = [
      ['Grand Palace Hotel','Luxury 5-star hotel in the heart of the city.','123 Main St','New York','USA',350,4.8,320,['WiFi','Pool','Spa','Gym','Restaurant'],['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],50,'luxury'],
      ['Sunset Beach Resort','Beachfront resort with stunning ocean views.','456 Ocean Dr','Miami','USA',280,4.6,210,['WiFi','Pool','Beach Access','Restaurant'],['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],35,'resort'],
      ['City Center Inn','Affordable hotel for business travelers.','789 Business Blvd','Chicago','USA',120,4.2,180,['WiFi','Gym','Business Center'],['https://images.unsplash.com/photo-1551882547-ff40c4fe1fa7?w=800'],80,'business'],
      ['Mountain View Lodge','Cozy mountain retreat surrounded by nature.','10 Alpine Rd','Denver','USA',195,4.7,150,['WiFi','Fireplace','Hiking','Spa'],['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],20,'resort'],
      ['The Boutique Hotel','Chic boutique hotel with unique rooms.','22 Art District','Los Angeles','USA',220,4.5,95,['WiFi','Bar','Rooftop Pool'],['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],15,'boutique'],
      ['Harbor View Hotel','Classic waterfront hotel with panoramic views.','5 Harbor Lane','San Francisco','USA',310,4.4,270,['WiFi','Restaurant','Gym'],['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],40,'luxury'],
    ];
    for (const h of hotels) {
      await db.run_p('INSERT INTO hotels (id,name,description,location,city,country,price_per_night,rating,total_reviews,amenities,images,available_rooms,category) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [uuidv4(),h[0],h[1],h[2],h[3],h[4],h[5],h[6],h[7],JSON.stringify(h[8]),JSON.stringify(h[9]),h[10],h[11]]);
    }
  }
  console.log('Database initialized');
}

module.exports = { db, initDatabase };
