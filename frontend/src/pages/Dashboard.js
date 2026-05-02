import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const statusColor = { pending: 'badge-warning', confirmed: 'badge-success', cancelled: 'badge-danger' };

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/bookings/my').then(res => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await axios.put(`/api/bookings/${id}/cancel`);
    setBookings(b => b.map(bk => bk.id === id ? { ...bk, status: 'cancelled' } : bk));
  };

  return (
    <div className="dashboard page">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1>My Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong></p>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-card card">
            <span className="stat-icon">🏨</span>
            <div><span className="stat-val">{bookings.length}</span><p>Total Bookings</p></div>
          </div>
          <div className="stat-card card">
            <span className="stat-icon">✅</span>
            <div><span className="stat-val">{bookings.filter(b => b.status === 'confirmed').length}</span><p>Confirmed</p></div>
          </div>
          <div className="stat-card card">
            <span className="stat-icon">⏳</span>
            <div><span className="stat-val">{bookings.filter(b => b.status === 'pending').length}</span><p>Pending</p></div>
          </div>
          <div className="stat-card card">
            <span className="stat-icon">💰</span>
            <div>
              <span className="stat-val">${bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.total_price, 0).toFixed(0)}</span>
              <p>Total Spent</p>
            </div>
          </div>
        </div>

        <section className="bookings-section">
          <h2>My Bookings</h2>
          {loading ? <div className="loading-screen" style={{ height: '200px' }}><div className="spinner" /></div>
            : bookings.length === 0 ? <p className="empty">No bookings yet. <a href="/hotels">Browse hotels →</a></p>
            : (
              <div className="bookings-list">
                {bookings.map(b => (
                  <div key={b.id} className="booking-row card">
                    <div className="booking-img" style={{ backgroundImage: `url(${b.images?.[0] || ''})` }} />
                    <div className="booking-info">
                      <div className="booking-top">
                        <h3>{b.hotel_name}</h3>
                        <span className={`badge ${statusColor[b.status] || 'badge-primary'}`}>{b.status}</span>
                      </div>
                      <p className="booking-loc">📍 {b.city}</p>
                      <div className="booking-dates">
                        <span>📅 {b.check_in} → {b.check_out}</span>
                        <span>👥 {b.guests} guest(s) · {b.rooms} room(s)</span>
                      </div>
                      <div className="booking-footer">
                        <strong className="booking-price">${b.total_price}</strong>
                        <span className={`badge ${b.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{b.payment_status}</span>
                        {b.status === 'pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(b.id)}>Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </div>
  );
}
