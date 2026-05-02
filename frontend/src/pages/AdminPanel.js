import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotelForm, setHotelForm] = useState({ name: '', description: '', location: '', city: '', country: '', price_per_night: '', available_rooms: 10, category: 'standard', amenities: '', images: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('/api/admin/stats').then(r => setStats(r.data));
    axios.get('/api/hotels').then(r => setHotels(r.data));
    axios.get('/api/bookings').then(r => setBookings(r.data));
    axios.get('/api/admin/users').then(r => setUsers(r.data));
  }, []);

  const addHotel = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hotels', {
        ...hotelForm,
        price_per_night: Number(hotelForm.price_per_night),
        amenities: hotelForm.amenities.split(',').map(a => a.trim()).filter(Boolean),
        images: hotelForm.images ? [hotelForm.images] : []
      });
      setMsg('✅ Hotel added successfully!');
      axios.get('/api/hotels').then(r => setHotels(r.data));
      setHotelForm({ name: '', description: '', location: '', city: '', country: '', price_per_night: '', available_rooms: 10, category: 'standard', amenities: '', images: '' });
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed to add hotel.')); }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel?')) return;
    await axios.delete(`/api/hotels/${id}`);
    setHotels(h => h.filter(hotel => hotel.id !== id));
  };

  const updateBooking = async (id, status, payment_status) => {
    await axios.put(`/api/bookings/${id}/status`, { status, payment_status });
    setBookings(b => b.map(bk => bk.id === id ? { ...bk, status, payment_status } : bk));
  };

  return (
    <div className="admin page">
      <div className="container">
        <h1>Admin Panel</h1>

        <div className="admin-tabs">
          {['overview', 'hotels', 'bookings', 'users'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div>
            <div className="admin-stats">
              <div className="astat card"><span>🏨</span><div><strong>{stats.totalHotels}</strong><p>Hotels</p></div></div>
              <div className="astat card"><span>👥</span><div><strong>{stats.totalUsers}</strong><p>Users</p></div></div>
              <div className="astat card"><span>📋</span><div><strong>{stats.totalBookings}</strong><p>Bookings</p></div></div>
              <div className="astat card"><span>💰</span><div><strong>${stats.totalRevenue?.toFixed(0)}</strong><p>Revenue</p></div></div>
            </div>
            <h2 style={{ marginBottom: 16 }}>Recent Bookings</h2>
            <div className="admin-table-wrap card">
              <table className="admin-table">
                <thead><tr><th>Guest</th><th>Hotel</th><th>Check-in</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentBookings?.map(b => (
                    <tr key={b.id}>
                      <td>{b.user_name}</td><td>{b.hotel_name}</td><td>{b.check_in}</td>
                      <td>${b.total_price}</td><td><span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hotels */}
        {tab === 'hotels' && (
          <div className="admin-hotels">
            <div className="add-hotel-form card">
              <h2>Add New Hotel</h2>
              {msg && <p style={{ marginBottom: 12, color: msg.startsWith('✅') ? 'green' : 'red' }}>{msg}</p>}
              <form onSubmit={addHotel} className="hotel-form-grid">
                <div className="form-group"><label>Hotel Name</label><input required value={hotelForm.name} onChange={e => setHotelForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label>City</label><input required value={hotelForm.city} onChange={e => setHotelForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div className="form-group"><label>Country</label><input required value={hotelForm.country} onChange={e => setHotelForm(f => ({ ...f, country: e.target.value }))} /></div>
                <div className="form-group"><label>Location/Address</label><input value={hotelForm.location} onChange={e => setHotelForm(f => ({ ...f, location: e.target.value }))} /></div>
                <div className="form-group"><label>Price / Night ($)</label><input type="number" required value={hotelForm.price_per_night} onChange={e => setHotelForm(f => ({ ...f, price_per_night: e.target.value }))} /></div>
                <div className="form-group"><label>Available Rooms</label><input type="number" value={hotelForm.available_rooms} onChange={e => setHotelForm(f => ({ ...f, available_rooms: e.target.value }))} /></div>
                <div className="form-group"><label>Category</label>
                  <select value={hotelForm.category} onChange={e => setHotelForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="standard">Standard</option><option value="luxury">Luxury</option>
                    <option value="resort">Resort</option><option value="boutique">Boutique</option><option value="business">Business</option>
                  </select>
                </div>
                <div className="form-group"><label>Image URL</label><input type="url" placeholder="https://..." value={hotelForm.images} onChange={e => setHotelForm(f => ({ ...f, images: e.target.value }))} /></div>
                <div className="form-group full-width"><label>Description</label><textarea rows="2" value={hotelForm.description} onChange={e => setHotelForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="form-group full-width"><label>Amenities (comma-separated)</label><input placeholder="WiFi, Pool, Gym" value={hotelForm.amenities} onChange={e => setHotelForm(f => ({ ...f, amenities: e.target.value }))} /></div>
                <div className="full-width"><button type="submit" className="btn btn-primary">Add Hotel</button></div>
              </form>
            </div>
            <h2>All Hotels ({hotels.length})</h2>
            <div className="admin-table-wrap card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>City</th><th>Category</th><th>Price/Night</th><th>Rating</th><th>Rooms</th><th>Action</th></tr></thead>
                <tbody>
                  {hotels.map(h => (
                    <tr key={h.id}>
                      <td><strong>{h.name}</strong></td><td>{h.city}</td><td><span className="badge badge-primary">{h.category}</span></td>
                      <td>${h.price_per_night}</td><td>★ {h.rating}</td><td>{h.available_rooms}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteHotel(h.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div>
            <h2 style={{ marginBottom: 16 }}>All Bookings ({bookings.length})</h2>
            <div className="admin-table-wrap card">
              <table className="admin-table">
                <thead><tr><th>Guest</th><th>Hotel</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.user_name}<br /><small>{b.email}</small></td>
                      <td>{b.hotel_name}</td><td>{b.check_in}</td><td>{b.check_out}</td>
                      <td>${b.total_price}</td>
                      <td><span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>{b.status}</span></td>
                      <td><span className={`badge badge-${b.payment_status === 'paid' ? 'success' : 'warning'}`}>{b.payment_status}</span></td>
                      <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {b.status !== 'confirmed' && <button className="btn btn-sm btn-primary" onClick={() => updateBooking(b.id, 'confirmed', 'paid')}>Confirm</button>}
                        {b.status !== 'cancelled' && <button className="btn btn-sm btn-danger" onClick={() => updateBooking(b.id, 'cancelled', b.payment_status)}>Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <h2 style={{ marginBottom: 16 }}>All Users ({users.length})</h2>
            <div className="admin-table-wrap card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td><td>{u.email}</td><td>{u.phone || '—'}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
