import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './HotelDetail.css';

export default function HotelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ check_in: '', check_out: '', guests: 1, rooms: 1, special_requests: '' });
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingErr, setBookingErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/hotels/${id}`).then(res => setHotel(res.data)).finally(() => setLoading(false));
  }, [id]);

  const nights = booking.check_in && booking.check_out
    ? Math.max(0, Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000))
    : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true); setBookingErr(''); setBookingMsg('');
    try {
      await axios.post('/api/bookings', { hotel_id: id, ...booking });
      setBookingMsg('🎉 Booking confirmed! Check your dashboard.');
      setBooking({ check_in: '', check_out: '', guests: 1, rooms: 1, special_requests: '' });
    } catch (err) {
      setBookingErr(err.response?.data?.error || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!hotel) return <div className="page container"><p>Hotel not found.</p></div>;

  return (
    <div className="hotel-detail page">
      <div className="detail-hero" style={{ backgroundImage: `url(${hotel.images?.[0] || ''})` }}>
        <div className="detail-hero-overlay" />
        <div className="container detail-hero-content">
          <span className={`badge badge-primary`}>{hotel.category}</span>
          <h1>{hotel.name}</h1>
          <p>📍 {hotel.location}, {hotel.city}, {hotel.country}</p>
          <div className="detail-rating">
            <span className="stars">★</span> {hotel.rating} ({hotel.total_reviews} reviews)
          </div>
        </div>
      </div>

      <div className="container detail-body">
        <div className="detail-layout">
          {/* Left: info */}
          <div className="detail-info">
            <section className="detail-section">
              <h2>About this Hotel</h2>
              <p>{hotel.description}</p>
            </section>

            <section className="detail-section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {hotel.amenities?.map(a => <span key={a} className="amenity-tag">✓ {a}</span>)}
              </div>
            </section>

            <section className="detail-section">
              <h2>Guest Reviews</h2>
              {hotel.reviews?.length === 0 ? <p className="no-reviews">No reviews yet. Be the first!</p> : (
                <div className="reviews-list">
                  {hotel.reviews?.map(r => (
                    <div key={r.id} className="review-card">
                      <div className="review-top">
                        <strong>{r.user_name}</strong>
                        <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <p>{r.comment}</p>
                      <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: booking widget */}
          <div className="booking-widget card">
            <div className="booking-price">
              <span className="big-price">${hotel.price_per_night}</span>
              <span> / night</span>
            </div>
            <form onSubmit={handleBook} className="booking-form">
              {bookingMsg && <div className="success-msg">{bookingMsg}</div>}
              {bookingErr && <div className="error-msg">{bookingErr}</div>}
              <div className="form-group">
                <label>Check-in</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={booking.check_in} onChange={e => setBooking(b => ({ ...b, check_in: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input type="date" required min={booking.check_in || new Date().toISOString().split('T')[0]}
                  value={booking.check_out} onChange={e => setBooking(b => ({ ...b, check_out: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Guests</label>
                  <input type="number" min="1" max="10" value={booking.guests} onChange={e => setBooking(b => ({ ...b, guests: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Rooms</label>
                  <input type="number" min="1" max="10" value={booking.rooms} onChange={e => setBooking(b => ({ ...b, rooms: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Special Requests</label>
                <textarea rows="2" placeholder="Any special requests..." value={booking.special_requests} onChange={e => setBooking(b => ({ ...b, special_requests: e.target.value }))} />
              </div>
              {nights > 0 && (
                <div className="booking-summary">
                  <span>${hotel.price_per_night} × {nights} nights × {booking.rooms} room(s)</span>
                  <strong>${hotel.price_per_night * nights * booking.rooms}</strong>
                </div>
              )}
              <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Booking...' : user ? 'Book Now' : 'Login to Book'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
