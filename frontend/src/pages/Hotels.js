import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import HotelCard from '../components/HotelCard';
import './Hotels.css';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: '', category: searchParams.get('category') || '',
    min_price: '', max_price: '', sort: 'rating'
  });

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    axios.get('/api/hotels', { params })
      .then(res => setHotels(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  const update = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div className="hotels-page page">
      <div className="container">
        <div className="hotels-header">
          <h1>Browse Hotels</h1>
          <p>{hotels.length} hotels found</p>
        </div>
        <div className="hotels-layout">
          {/* Sidebar filters */}
          <aside className="filters-sidebar">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Search</label>
              <input type="text" placeholder="Name, city..." value={filters.search} onChange={e => update('search', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select value={filters.category} onChange={e => update('category', e.target.value)}>
                <option value="">All Categories</option>
                <option value="luxury">Luxury</option>
                <option value="resort">Resort</option>
                <option value="boutique">Boutique</option>
                <option value="business">Business</option>
                <option value="standard">Standard</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Min Price / Night</label>
              <input type="number" placeholder="$0" value={filters.min_price} onChange={e => update('min_price', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Max Price / Night</label>
              <input type="number" placeholder="Any" value={filters.max_price} onChange={e => update('max_price', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select value={filters.sort} onChange={e => update('sort', e.target.value)}>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setFilters({ search: '', city: '', category: '', min_price: '', max_price: '', sort: 'rating' })}>
              Clear Filters
            </button>
          </aside>

          {/* Results */}
          <main className="hotels-results">
            {loading ? (
              <div className="loading-screen" style={{ height: '400px' }}><div className="spinner" /></div>
            ) : hotels.length === 0 ? (
              <div className="empty-state">
                <p>🔍 No hotels found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="hotel-grid">
                {hotels.map(h => <HotelCard key={h.id} hotel={h} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
