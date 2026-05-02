import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HotelCard.css';

export default function HotelCard({ hotel }) {
  const navigate = useNavigate();
  const image = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';

  return (
    <div className="hotel-card card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
      <div className="hotel-card-img" style={{ backgroundImage: `url(${image})` }}>
        <span className={`badge badge-primary cat-badge`}>{hotel.category}</span>
      </div>
      <div className="hotel-card-body">
        <div className="hotel-card-top">
          <h3>{hotel.name}</h3>
          <div className="rating">
            <span className="stars">★</span> {hotel.rating} <span className="reviews">({hotel.total_reviews})</span>
          </div>
        </div>
        <p className="hotel-location">📍 {hotel.city}, {hotel.country}</p>
        <p className="hotel-desc">{hotel.description?.slice(0, 80)}...</p>
        <div className="hotel-card-footer">
          <div className="price">
            <span className="price-amount">${hotel.price_per_night}</span>
            <span className="price-unit"> / night</span>
          </div>
          <button className="btn btn-primary btn-sm">View Details</button>
        </div>
      </div>
    </div>
  );
}
