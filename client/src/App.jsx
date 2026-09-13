import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5001/api';

export default function App() {
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    properties: [],
    cities: [],
    years: []
  });

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/filters`)
      .then(res => res.json())
      .then(options => {
        if (options && !options.error) {
          setFilterOptions(options);
        }
      })
      .catch(err => console.error('Failed to load filter options:', err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedBrand, selectedProperty, selectedCity, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedBrand) params.append('brand', selectedBrand);
      if (selectedProperty) params.append('property', selectedProperty);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedYear) params.append('year', selectedYear);

      const res = await fetch(`${API_BASE}/financials?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve records from Snowflake');
      const rows = await res.json();
      setData(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedBrand('');
    setSelectedProperty('');
    setSelectedCity('');
    setSelectedYear('');
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '40px auto', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '0 20px', color: '#222' }}>
      <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Hospitality Revenue Intelligence</h1>
        <p style={{ margin: '8px 0 0', color: '#64748b' }}>Connected to Snowflake Table: <code>MY_COMPANY_DB.SAMPLE_DATA.FINANCE</code></p>
      </header>

      {/* Filter Bar */}
      <section style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Hotel Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="">All Brands</option>
              {filterOptions.brands?.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Property Name</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="">All Properties</option>
              {filterOptions.properties?.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="">All Cities</option>
              {filterOptions.cities?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fiscal Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="">All Years</option>
              {filterOptions.years?.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <button
              onClick={handleReset}
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, height: '36px', width: '100%' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      {/* Results Content */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Querying Snowflake...</p>
      ) : error ? (
        <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '14px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#f8fafc' }}>
                <th style={{ padding: '12px 14px' }}>RECORD_ID</th>
                <th style={{ padding: '12px 14px' }}>Hotel Brand</th>
                <th style={{ padding: '12px 14px' }}>Property</th>
                <th style={{ padding: '12px 14px' }}>City</th>
                <th style={{ padding: '12px 14px' }}>Period</th>
                <th style={{ padding: '12px 14px' }}>Room Revenue</th>
                <th style={{ padding: '12px 14px' }}>F&B Revenue</th>
                <th style={{ padding: '12px 14px' }}>Banquet/Events</th>
                <th style={{ padding: '12px 14px' }}>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No records found matching current filters.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.RECORD_ID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#2563eb' }}>#{row.RECORD_ID}</td>
                    <td style={{ padding: '12px 14px' }}>{row.HOTEL_BRAND}</td>
                    <td style={{ padding: '12px 14px' }}>{row.PROPERTY_NAME}</td>
                    <td style={{ padding: '12px 14px' }}>{row.CITY}</td>
                    <td style={{ padding: '12px 14px' }}>{row.FISCAL_YEAR} {row.FISCAL_QUARTER}</td>
                    <td style={{ padding: '12px 14px' }}>{formatCurrency(row.ROOM_REVENUE)}</td>
                    <td style={{ padding: '12px 14px' }}>{formatCurrency(row.FB_REVENUE)}</td>
                    <td style={{ padding: '12px 14px' }}>{formatCurrency(row.BANQUET_EVENT_REVENUE)}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#16a34a' }}>
                      {formatCurrency(row.TOTAL_REVENUE)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
