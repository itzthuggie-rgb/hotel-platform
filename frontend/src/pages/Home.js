import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HotelCard from '../components/HotelCard';
import './Home.css';

export default function Home() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/hotels?sort=rating').then(res => setFeatured(res.data.slice(0, 3)));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hotels?search=${search}`);
  };

  return (
    <div className="home page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-eyebrow">Your Next Stay Awaits</p>
          <h1>Discover & Book <br />Exceptional Hotels</h1>
          <p className="hero-sub">Find the perfect place to stay — from boutique escapes to luxury resorts.</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text" placeholder="Search by city, hotel name..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-accent btn-lg">Search</button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container stats-inner">
          <div className="stat"><span className="stat-num">500+</span><span>Hotels</span></div>
          <div className="stat"><span className="stat-num">50K+</span><span>Happy Guests</span></div>
          <div className="stat"><span className="stat-num">100+</span><span>Cities</span></div>
          <div className="stat"><span className="stat-num">4.8★</span><span>Avg Rating</span></div>
        </div>
      </section>

      {/* Featured */}
      <section className="featured-section">
        <div className="container">
          <h2>Top Rated Hotels</h2>
          <p className="section-sub">Handpicked stays with exceptional reviews</p>
          <div className="hotel-grid">
            {featured.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/hotels')}>View All Hotels</button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {[
              { label: 'Luxury', icon: '✨', cat: 'luxury' },
              { label: 'Resort', icon: '🏖️', cat: 'resort' },
              { label: 'Boutique', icon: '🎨', cat: 'boutique' },
              { label: 'Business', icon: '💼', cat: 'business' },
            ].map(c => (
              <div key={c.cat} className="category-card" onClick={() => navigate(`/hotels?category=${c.cat}`)}>
                <span className="cat-icon">{c.icon}</span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>🏨 HotelLink &copy; {new Date().getFullYear()} — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
