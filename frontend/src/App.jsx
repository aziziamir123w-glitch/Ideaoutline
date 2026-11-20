import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/games';

export default function App() {
  const [games, setGames] = useState([]);
  const [platform, setPlatform] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (search) params.append('search', search);

    fetch(`${API_URL}?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error('API error:', err));
  }, [platform, search]);

  const addToCart = (game) => {
    setCart((prev) => [...prev, game]);
  };

  const topSellers = games.filter((g) => g.isTopSeller);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>DiscVault Game Shop</h1>
        <div>Cart ({cart.length}) — ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</div>
      </header>

      {/* Top Sellers Section */}
      <section style={{ background: '#111', color: '#fff', padding: 20, borderRadius: 8, marginBottom: 24 }}>
        <h2>Top Sellers</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {topSellers.map((game) => (
            <div key={game.id} style={{ background: '#222', padding: 16, borderRadius: 6, flex: '1 1 250px' }}>
              <span style={{ fontSize: 12, background: '#e11d48', padding: '2px 6px', borderRadius: 4 }}>
                {game.platform}
              </span>
              <h3>{game.title}</h3>
              <p>${game.price.toFixed(2)} • {game.stock} discs in stock</p>
              <button onClick={() => addToCart(game)} disabled={game.stock === 0}>
                Add Disc to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search games (e.g. GTA)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Platforms</option>
          <option value="PS5">PS5</option>
          <option value="Xbox Series X">Xbox Series X</option>
          <option value="Switch">Switch</option>
        </select>
      </div>

      {/* Catalog Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {games.map((game) => (
          <div key={game.id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
            <small>{game.platform} • {game.genre}</small>
            <h4>{game.title}</h4>
            <p><strong>${game.price.toFixed(2)}</strong> ({game.stock} left)</p>
            <button onClick={() => addToCart(game)} disabled={game.stock === 0}>
              {game.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
