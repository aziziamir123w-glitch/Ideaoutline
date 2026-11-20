import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const ACCOUNTS = [
  { username: 'buyer1', password: '123', role: 'Buyer', displayName: 'Alex Mercer (Buyer)' },
  { username: 'seller1', password: '123', role: 'Seller', displayName: 'DiscHub Store (Seller)' },
  { username: 'admin', password: '123', role: 'Admin', displayName: 'System Admin' },
];

const INITIAL_GAMES = [
  { id: 1, title: 'Grand Theft Auto VI', platform: 'PS5', genre: 'Action', price: 69.99, stock: 25, isTopSeller: true, sellerName: 'RockstarDirect' },
  { id: 2, title: 'Grand Theft Auto VI', platform: 'Xbox Series X', genre: 'Action', price: 69.99, stock: 18, isTopSeller: true, sellerName: 'RockstarDirect' },
  { id: 3, title: 'Red Dead Redemption 2', platform: 'PS5', genre: 'Action', price: 39.99, stock: 14, isTopSeller: true, sellerName: 'seller1' },
  { id: 4, title: 'EA Sports FC 26', platform: 'PS5', genre: 'Sports', price: 59.99, stock: 30, isTopSeller: true, sellerName: 'seller1' },
  { id: 5, title: "Marvel's Spider-Man 2", platform: 'PS5', genre: 'Action', price: 49.99, stock: 11, isTopSeller: false, sellerName: 'seller1' },
  { id: 6, title: 'God of War Ragnarök', platform: 'PS5', genre: 'Action RPG', price: 44.99, stock: 9, isTopSeller: false, sellerName: 'seller1' },
  { id: 7, title: 'Cyberpunk 2077: Ultimate Edition', platform: 'Xbox Series X', genre: 'RPG', price: 49.99, stock: 13, isTopSeller: false, sellerName: 'seller1' },
  { id: 8, title: 'Elden Ring: Shadow of the Erdtree Edition', platform: 'PS5', genre: 'RPG', price: 59.99, stock: 10, isTopSeller: false, sellerName: 'seller1' },
  { id: 9, title: 'The Legend of Zelda: Tears of the Kingdom', platform: 'Switch', genre: 'Adventure', price: 59.99, stock: 12, isTopSeller: false, sellerName: 'seller1' },
  { id: 10, title: 'Mario Kart 8 Deluxe', platform: 'Switch', genre: 'Racing', price: 49.99, stock: 20, isTopSeller: false, sellerName: 'seller1' },
];

const PLATFORM_STYLE = {
  PS5: { bg: 'rgba(37, 99, 235, 0.18)', border: 'rgba(59, 130, 246, 0.45)', text: '#93c5fd' },
  'Xbox Series X': { bg: 'rgba(22, 163, 74, 0.18)', border: 'rgba(34, 197, 94, 0.45)', text: '#86efac' },
  Switch: { bg: 'rgba(225, 29, 72, 0.18)', border: 'rgba(244, 63, 94, 0.45)', text: '#fda4af' },
  PC: { bg: 'rgba(124, 58, 237, 0.18)', border: 'rgba(139, 92, 246, 0.45)', text: '#c4b5fd' },
};

export default function App() {
  const [games, setGames] = useState(INITIAL_GAMES);
  const [apiOnline, setApiOnline] = useState(false);

  // Authenticated session (null = logged out / guest browsing)
  const [session, setSession] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [registerRole, setRegisterRole] = useState('Buyer');
  const [authError, setAuthError] = useState('');

  // Navigation & filters
  const [activeTab, setActiveTab] = useState('storefront'); // 'storefront' | 'studio'
  const [platform, setPlatform] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  // Studio form state (Seller & Admin)
  const [title, setTitle] = useState('');
  const [gamePlatform, setGamePlatform] = useState('PS5');
  const [genre, setGenre] = useState('Action');
  const [price, setPrice] = useState('59.99');
  const [stock, setStock] = useState('15');
  const [isTopSeller, setIsTopSeller] = useState(false);

  const notify = (message, tone = 'info') => {
    setToast({ message, tone });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadGames = async () => {
    try {
      const params = new URLSearchParams();
      if (platform !== 'All') params.append('platform', platform);
      if (search.trim()) params.append('search', search.trim());
      const res = await fetch(`${API_BASE}/games?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGames(data);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [platform, search]);

  const role = session?.role ?? 'Guest';
  const canSell = role === 'Seller' || role === 'Admin';
  const isAdmin = role === 'Admin';

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'X-User-Name': session?.username ?? 'guest',
    'X-User-Role': role,
  }), [session, role]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput;

    if (!cleanUser || !cleanPass) {
      setAuthError('Enter both username and password.');
      return;
    }

    if (authMode === 'register') {
      const exists = ACCOUNTS.some((a) => a.username.toLowerCase() === cleanUser.toLowerCase());
      if (exists) {
        setAuthError('Username already exists.');
        return;
      }
      const created = {
        username: cleanUser,
        password: cleanPass,
        role: registerRole,
        displayName: `${cleanUser} (${registerRole})`,
      };
      ACCOUNTS.push(created);
      setSession({ username: created.username, role: created.role, displayName: created.displayName });
      setAuthModalOpen(false);
      setUsernameInput('');
      setPasswordInput('');
      notify(`Account created. Signed in as ${created.username} (${created.role}).`, 'success');
      return;
    }

    if (apiOnline) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });
        if (!res.ok) {
          setAuthError('Invalid username or password.');
          return;
        }
        const data = await res.json();
        setSession({
          username: data.username,
          role: data.role,
          displayName: `${data.username} (${data.role})`,
        });
        setAuthModalOpen(false);
        setUsernameInput('');
        setPasswordInput('');
        notify(`Authenticated as ${data.username} — ${data.role}`, 'success');
        return;
      } catch {
        setAuthError('Unable to reach authentication server.');
        return;
      }
    }

    const found = ACCOUNTS.find(
      (a) => a.username.toLowerCase() === cleanUser.toLowerCase() && a.password === cleanPass
    );
    if (!found) {
      setAuthError('Invalid credentials. Check hint below.');
      return;
    }
    setSession({ username: found.username, role: found.role, displayName: found.displayName });
    setAuthModalOpen(false);
    setUsernameInput('');
    setPasswordInput('');
    notify(`Authenticated as ${found.username} — ${found.role}`, 'success');
  };

  const handleLogout = () => {
    setSession(null);
    if (activeTab === 'studio') setActiveTab('storefront');
    notify('Signed out.', 'info');
  };

  const addToCart = (game) => {
    if (game.stock <= 0) return;
    const existing = cart.find((item) => item.game.id === game.id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty >= game.stock) {
      notify(`Only ${game.stock} disc(s) available for ${game.title}.`, 'warn');
      return;
    }
    setCart(
      existing
        ? cart.map((item) => (item.game.id === game.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...cart, { game, quantity: 1 }]
    );
    notify(`Added ${game.title} (${game.platform}) to cart.`, 'success');
  };

  const updateQty = (gameId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.game.id !== gameId) return item;
          const next = item.quantity + delta;
          if (next <= 0) return null;
          if (next > item.game.stock) return item;
          return { ...item, quantity: next };
        })
        .filter(Boolean)
    );
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    if (apiOnline) {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: session?.username ?? 'Guest Buyer',
          items: cart.map((c) => ({ gameId: c.game.id, quantity: c.quantity })),
        }),
      });
      if (!res.ok) {
        notify('Order could not be processed.', 'error');
        return;
      }
      setCart([]);
      await loadGames();
      notify('Order confirmed! Stock deducted in SQLite.', 'success');
      return;
    }

    setGames((prev) =>
      prev.map((g) => {
        const bought = cart.find((c) => c.game.id === g.id);
        return bought ? { ...g, stock: Math.max(0, g.stock - bought.quantity) } : g;
      })
    );
    setCart([]);
    notify('Order confirmed in local mode.', 'success');
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!canSell) {
      notify('Seller or Admin login required.', 'error');
      return;
    }
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      platform: gamePlatform,
      genre: genre.trim() || 'Action',
      price: Math.max(0.01, Number(price) || 49.99),
      stock: Math.max(1, Number(stock) || 1),
      isTopSeller,
    };

    if (apiOnline) {
      const res = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        notify('Server rejected listing (check role permissions).', 'error');
        return;
      }
      setTitle('');
      setIsTopSeller(false);
      await loadGames();
      notify(`Listed "${payload.title}" in catalog.`, 'success');
      return;
    }

    setGames((prev) => [
      ...prev,
      { ...payload, id: Date.now(), sellerName: session.username },
    ]);
    setTitle('');
    setIsTopSeller(false);
    notify(`Listed "${payload.title}" in catalog.`, 'success');
  };

  const handleRestock = async (game, amount = 5) => {
    if (!canSell) return;
    if (apiOnline) {
      const res = await fetch(`${API_BASE}/games/${game.id}/restock`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ addStock: amount }),
      });
      if (res.ok) {
        await loadGames();
        notify(`Restocked +${amount} discs for ${game.title}.`, 'success');
      }
      return;
    }
    setGames((prev) => prev.map((g) => (g.id === game.id ? { ...g, stock: g.stock + amount } : g)));
    notify(`Restocked +${amount} discs for ${game.title}.`, 'success');
  };

  const handleDelete = async (game) => {
    if (!isAdmin) {
      notify('Only Admin can delete catalog items.', 'error');
      return;
    }
    if (apiOnline) {
      const res = await fetch(`${API_BASE}/games/${game.id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        await loadGames();
        notify(`Deleted "${game.title}".`, 'success');
      }
      return;
    }
    setGames((prev) => prev.filter((g) => g.id !== game.id));
    notify(`Deleted "${game.title}".`, 'success');
  };

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchPlatform = platform === 'All' || g.platform === platform;
      const matchQuery =
        !search.trim() ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.genre.toLowerCase().includes(search.toLowerCase());
      return matchPlatform && matchQuery;
    });
  }, [games, platform, search]);

  const topSellers = useMemo(() => games.filter((g) => g.isTopSeller), [games]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
  const totalInventoryUnits = games.reduce((sum, g) => sum + g.stock, 0);

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.brandGroup}>
            <div style={styles.logoMark}>DV</div>
            <div>
              <div style={styles.brandTitle}>DISCVAULT</div>
              <div style={styles.brandSub}>
                <span style={{ ...styles.dot, background: apiOnline ? '#22c55e' : '#eab308' }} />
                {apiOnline ? '.NET + SQLite Live' : 'Local Preview'} • {games.length} Titles • {totalInventoryUnits} Discs
              </div>
            </div>
          </div>

          <nav style={styles.navTabs}>
            <button
              onClick={() => setActiveTab('storefront')}
              style={{ ...styles.tabBtn, ...(activeTab === 'storefront' ? styles.tabBtnActive : {}) }}
            >
              Storefront
            </button>
            {canSell && (
              <button
                onClick={() => setActiveTab('studio')}
                style={{ ...styles.tabBtn, ...(activeTab === 'studio' ? styles.tabBtnActive : {}) }}
              >
                {isAdmin ? 'Admin Console' : 'Seller Studio'}
              </button>
            )}
          </nav>

          <div style={styles.authArea}>
            {session ? (
              <>
                <span style={styles.rolePill}>{session.displayName}</span>
                <button onClick={handleLogout} style={styles.secondaryBtn}>
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthModalOpen(true);
                }}
                style={styles.primaryBtn}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div style={styles.toastWrap}>
          <div style={styles.toastCard}>{toast.message}</div>
        </div>
      )}

      {/* Credentials Login / Register Modal */}
      {authModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setAuthModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                {authMode === 'login' ? 'Account Sign In' : 'Create Account'}
              </h2>
              <button onClick={() => setAuthModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modeSwitch}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                style={{ ...styles.subTab, ...(authMode === 'login' ? styles.subTabActive : {}) }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                style={{ ...styles.subTab, ...(authMode === 'register' ? styles.subTabActive : {}) }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={styles.formStack}>
              <label style={styles.label}>
                Username
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter username"
                  style={styles.input}
                  autoFocus
                />
              </label>

              <label style={styles.label}>
                Password
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  style={styles.input}
                />
              </label>

              {authMode === 'register' && (
                <label style={styles.label}>
                  Account Role
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                    style={styles.input}
                  >
                    <option value="Buyer">Buyer (Browse & Purchase Discs)</option>
                    <option value="Seller">Seller (List & Restock Discs)</option>
                  </select>
                </label>
              )}

              {authError && <div style={styles.errorText}>{authError}</div>}

              <button type="submit" style={styles.primaryBtn}>
                {authMode === 'login' ? 'Sign In' : 'Create & Sign In'}
              </button>
            </form>

            <div style={styles.hintBox}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Demo Credentials (password: <code>123</code>)</div>
              <div>Buyer: <code>buyer1</code> • Seller: <code>seller1</code> • Admin: <code>admin</code></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={styles.container}>
        {activeTab === 'storefront' ? (
          <>
            {/* Featured Top Sellers */}
            <section style={styles.heroSection}>
              <div style={styles.sectionHeaderRow}>
                <div>
                  <span style={styles.eyebrow}>FEATURED PHYSICAL RELEASES</span>
                  <h1 style={styles.heroTitle}>Top Selling Game Discs</h1>
                </div>
                <span style={styles.heroMeta}>Instant disc stock tracking</span>
              </div>

              <div style={styles.topGrid}>
                {topSellers.slice(0, 3).map((game) => {
                  const pStyle = PLATFORM_STYLE[game.platform] || PLATFORM_STYLE.PC;
                  return (
                    <div key={game.id} style={styles.topCard}>
                      <div style={styles.cardTopRow}>
                        <span style={{ ...styles.badge, background: pStyle.bg, borderColor: pStyle.border, color: pStyle.text }}>
                          {game.platform}
                        </span>
                        <span style={styles.topTag}>TOP SELLER</span>
                      </div>
                      <h3 style={styles.cardTitle}>{game.title}</h3>
                      <div style={styles.cardSub}>{game.genre} • Sold by {game.sellerName}</div>
                      <div style={styles.cardFooter}>
                        <div>
                          <div style={styles.price}>${Number(game.price).toFixed(2)}</div>
                          <div style={styles.stockText}>{game.stock} discs ready</div>
                        </div>
                        <button
                          onClick={() => addToCart(game)}
                          disabled={game.stock === 0}
                          style={{ ...styles.primaryBtn, opacity: game.stock === 0 ? 0.45 : 1 }}
                        >
                          {game.stock > 0 ? 'Add Disc' : 'Sold Out'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Storefront Layout: Catalog + Cart Sidebar */}
            <div style={styles.storeGrid}>
              <section>
                <div style={styles.toolbar}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search GTA VI, Red Dead, Zelda, genre..."
                    style={{ ...styles.input, flex: 1, minWidth: 210 }}
                  />
                  <div style={styles.filterPills}>
                    {['All', 'PS5', 'Xbox Series X', 'Switch', 'PC'].map((plat) => (
                      <button
                        key={plat}
                        onClick={() => setPlatform(plat)}
                        style={{ ...styles.pillBtn, ...(platform === plat ? styles.pillBtnActive : {}) }}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.catalogGrid}>
                  {filteredGames.map((game) => {
                    const pStyle = PLATFORM_STYLE[game.platform] || PLATFORM_STYLE.PC;
                    return (
                      <article key={game.id} style={styles.gameCard}>
                        <div>
                          <div style={styles.cardTopRow}>
                            <span style={{ ...styles.badge, background: pStyle.bg, borderColor: pStyle.border, color: pStyle.text }}>
                              {game.platform}
                            </span>
                            <span style={styles.genreLabel}>{game.genre}</span>
                          </div>
                          <h4 style={styles.gameTitle}>{game.title}</h4>
                          <div style={styles.sellerCaption}>Seller: {game.sellerName}</div>
                        </div>

                        <div style={styles.gameBottom}>
                          <div style={styles.priceRow}>
                            <span style={styles.price}>${Number(game.price).toFixed(2)}</span>
                            <span style={{
                              ...styles.stockBadge,
                              color: game.stock > 5 ? '#86efac' : game.stock > 0 ? '#fde047' : '#fca5a5',
                            }}>
                              {game.stock > 0 ? `${game.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>

                          <div style={styles.actionRow}>
                            <button
                              onClick={() => addToCart(game)}
                              disabled={game.stock === 0}
                              style={{ ...styles.primaryBtn, flex: 1, opacity: game.stock === 0 ? 0.45 : 1 }}
                            >
                              {game.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                            </button>
                            {canSell && (
                              <button onClick={() => handleRestock(game, 5)} style={styles.secondaryBtn}>
                                +5
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDelete(game)} style={styles.dangerBtn}>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Order & Cart Panel */}
              <aside style={styles.cartPanel}>
                <div style={styles.cartHeader}>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Order Cart</h2>
                  <span style={styles.countBadge}>{cartCount}</span>
                </div>

                {cart.length === 0 ? (
                  <div style={styles.emptyCart}>
                    No discs selected yet. Pick a title from the catalog to start an order.
                  </div>
                ) : (
                  <>
                    <div style={styles.cartItems}>
                      {cart.map(({ game, quantity }) => (
                        <div key={game.id} style={styles.cartRow}>
                          <div style={{ minWidth: 0 }}>
                            <div style={styles.cartTitle}>{game.title}</div>
                            <div style={styles.cartMeta}>
                              {game.platform} • ${(game.price * quantity).toFixed(2)}
                            </div>
                          </div>
                          <div style={styles.qtyControls}>
                            <button onClick={() => updateQty(game.id, -1)} style={styles.qtyBtn}>−</button>
                            <span style={{ minWidth: 18, textAlign: 'center', fontSize: 13 }}>{quantity}</span>
                            <button onClick={() => updateQty(game.id, 1)} style={styles.qtyBtn}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.cartSummary}>
                      <div style={styles.summaryLine}>
                        <span>Buyer</span>
                        <strong>{session?.username ?? 'Guest'}</strong>
                      </div>
                      <div style={{ ...styles.summaryLine, fontSize: 17, marginTop: 6 }}>
                        <span>Total</span>
                        <strong style={{ color: '#4ade80' }}>${cartSubtotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    <button onClick={checkout} style={{ ...styles.checkoutBtn, width: '100%' }}>
                      Complete Order
                    </button>
                  </>
                )}
              </aside>
            </div>
          </>
        ) : (
          /* Seller & Admin Inventory Studio */
          <section style={styles.studioSection}>
            <div style={styles.sectionHeaderRow}>
              <div>
                <span style={styles.eyebrow}>{role.toUpperCase()} ACCESS</span>
                <h1 style={styles.heroTitle}>
                  {isAdmin ? 'Admin Inventory & Catalog Control' : 'Seller Disc Listing Studio'}
                </h1>
              </div>
            </div>

            <form onSubmit={handleCreateGame} style={styles.studioForm}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Game Title (e.g., Ghost of Yōtei)"
                style={{ ...styles.input, flex: '2 1 220px' }}
                required
              />
              <select value={gamePlatform} onChange={(e) => setGamePlatform(e.target.value)} style={{ ...styles.input, width: 150 }}>
                <option>PS5</option>
                <option>Xbox Series X</option>
                <option>Switch</option>
                <option>PC</option>
              </select>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Genre"
                style={{ ...styles.input, width: 130 }}
              />
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                style={{ ...styles.input, width: 100 }}
              />
              <input
                type="number"
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                style={{ ...styles.input, width: 90 }}
              />
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isTopSeller}
                  onChange={(e) => setIsTopSeller(e.target.checked)}
                />
                Top Seller
              </label>
              <button type="submit" style={styles.primaryBtn}>Publish Disc</button>
            </form>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Platform</th>
                    <th style={styles.th}>Seller</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.id} style={styles.tr}>
                      <td style={styles.td}><strong>{g.title}</strong></td>
                      <td style={styles.td}>{g.platform}</td>
                      <td style={styles.td}>{g.sellerName}</td>
                      <td style={styles.td}>${Number(g.price).toFixed(2)}</td>
                      <td style={styles.td}>{g.stock}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleRestock(g, 5)} style={styles.secondaryBtn}>+5 Stock</button>
                          {isAdmin && (
                            <button onClick={() => handleDelete(g)} style={styles.dangerBtn}>Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#090d16',
    color: '#e5e7eb',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: 'rgba(9, 13, 22, 0.88)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #1e293b',
  },
  navInner: {
    maxWidth: 1240,
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: 1,
    color: '#f8fafc',
  },
  brandSub: {
    fontSize: 12,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
  },
  navTabs: {
    display: 'flex',
    gap: 8,
    background: '#111827',
    padding: 4,
    borderRadius: 10,
    border: '1px solid #1f2937',
  },
  tabBtn: {
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '7px 14px',
    borderRadius: 7,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  tabBtnActive: {
    background: '#1e293b',
    color: '#f8fafc',
  },
  authArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  rolePill: {
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 999,
    background: '#172554',
    color: '#93c5fd',
    border: '1px solid #1d4ed8',
  },
  container: {
    maxWidth: 1240,
    margin: '0 auto',
    padding: '28px 24px 56px',
  },
  heroSection: {
    background: 'linear-gradient(135deg, #111827 0%, #171936 55%, #231129 100%)',
    border: '1px solid #263047',
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: '#60a5fa',
    display: 'block',
    marginBottom: 4,
  },
  heroTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#f8fafc',
  },
  heroMeta: {
    fontSize: 13,
    color: '#94a3b8',
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
    gap: 16,
  },
  topCard: {
    background: 'rgba(11, 16, 28, 0.82)',
    border: '1px solid #2a354d',
    borderRadius: 12,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 12,
  },
  topTag: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.8,
    padding: '3px 8px',
    borderRadius: 999,
    background: 'rgba(245, 158, 11, 0.16)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.35)',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 999,
    border: '1px solid',
  },
  genreLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: 18,
    color: '#f8fafc',
  },
  cardSub: {
    fontSize: 13,
    color: '#94a3b8',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #1e293b',
  },
  price: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f8fafc',
  },
  stockText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  storeGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gap: 24,
    alignItems: 'start',
  },
  toolbar: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  filterPills: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  pillBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #243046',
    background: '#111827',
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  pillBtnActive: {
    background: '#2563eb',
    borderColor: '#3b82f6',
    color: '#fff',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))',
    gap: 16,
  },
  gameCard: {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 14,
  },
  gameTitle: {
    margin: '4px 0',
    fontSize: 16,
    color: '#f8fafc',
    lineHeight: 1.35,
  },
  sellerCaption: {
    fontSize: 12,
    color: '#64748b',
  },
  gameBottom: {
    borderTop: '1px solid #1e293b',
    paddingTop: 12,
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  stockBadge: {
    fontSize: 12,
    fontWeight: 600,
  },
  actionRow: {
    display: 'flex',
    gap: 6,
  },
  cartPanel: {
    position: 'sticky',
    top: 84,
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 14,
    padding: 18,
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottom: '1px solid #1f2937',
    marginBottom: 14,
  },
  countBadge: {
    background: '#1e293b',
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 700,
    padding: '2px 9px',
    borderRadius: 999,
  },
  emptyCart: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 1.5,
    padding: '18px 0',
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 280,
    overflowY: 'auto',
    marginBottom: 14,
  },
  cartRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    background: '#0b101b',
    border: '1px solid #1e293b',
    borderRadius: 9,
    padding: '10px 12px',
  },
  cartTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f1f5f9',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cartMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#f8fafc',
    cursor: 'pointer',
    fontWeight: 700,
  },
  cartSummary: {
    borderTop: '1px solid #1f2937',
    paddingTop: 12,
    marginBottom: 14,
  },
  summaryLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#cbd5e1',
  },
  studioSection: {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 14,
    padding: 24,
  },
  studioForm: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    background: '#0b101b',
    padding: 16,
    borderRadius: 10,
    border: '1px solid #1e293b',
    marginBottom: 20,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#cbd5e1',
    cursor: 'pointer',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    color: '#94a3b8',
    borderBottom: '1px solid #243046',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tr: {
    borderBottom: '1px solid #192234',
  },
  td: {
    padding: '12px',
    color: '#e2e8f0',
  },
  input: {
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid #2b3852',
    background: '#0b101b',
    color: '#f8fafc',
    fontSize: 14,
    outline: 'none',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: 500,
  },
  primaryBtn: {
    padding: '9px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  checkoutBtn: {
    padding: '11px 16px',
    borderRadius: 9,
    border: 'none',
    background: '#16a34a',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '8px 11px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#e2e8f0',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  dangerBtn: {
    padding: '8px 11px',
    borderRadius: 8,
    border: '1px solid rgba(239, 68, 68, 0.45)',
    background: 'rgba(127, 29, 29, 0.25)',
    color: '#fca5a5',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    background: 'rgba(0, 0, 0, 0.72)',
    display: 'grid',
    placeItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    background: '#111827',
    border: '1px solid #2b3852',
    borderRadius: 14,
    padding: 22,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: 16,
    cursor: 'pointer',
  },
  modeSwitch: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    background: '#0b101b',
    padding: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  subTab: {
    padding: '7px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontWeight: 600,
    cursor: 'pointer',
  },
  subTabActive: {
    background: '#1e293b',
    color: '#fff',
  },
  formStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    background: 'rgba(127, 29, 29, 0.25)',
    padding: '8px 10px',
    borderRadius: 7,
  },
  hintBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: '1px solid #1f2937',
    fontSize: 12,
    color: '#94a3b8',
  },
  toastWrap: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 60,
  },
  toastCard: {
    background: '#1e293b',
    color: '#f8fafc',
    border: '1px solid #3b82f6',
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
  },
};