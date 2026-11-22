// Home – women's fashion storefront featuring interactive Three.js 3D studio, products, and categories.
import { useState, useEffect } from 'react';
import products from '../data/products';
import categories from '../data/categories';
import { useCart } from '../context/CartContext';
import ProductViewer3D from '../components/ProductViewer3D';

export default function Home() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [active3DProduct, setActive3DProduct] = useState(products[0]); // For inline 3D studio
  const [modal3DProduct, setModal3DProduct] = useState(null); // For full-screen 3D inspection modal
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Listen for category selection events from the Navbar
  useEffect(() => {
    function onSelectCategory(e) {
      if (e.detail) {
        setActiveCategory(e.detail);
      }
    }
    window.addEventListener('selectCategory', onSelectCategory);
    return () => window.removeEventListener('selectCategory', onSelectCategory);
  }, []);

  // Filter products by category
  const filteredProducts =
    activeCategory === 'all'
      ? products
      : activeCategory === 'trending'
      ? products.filter((p) => p.tag === 'trending' || p.tag === 'bestseller')
      : products.filter((p) => p.category === activeCategory);

  function handleAddToCart(product, e) {
    if (e) e.stopPropagation();
    addToCart(product, true);
    setToastMessage(`Added "${product.name}" to your bag.`);
    setTimeout(() => setToastMessage(''), 3000);
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('Please enter a valid email address.');
      return;
    }
    setNewsletterStatus('success');
    setNewsletterEmail('');
  }

  return (
    <div className="home-wrapper">
      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* 3D Modal Viewer (When clicked "View in 3D" on any card) */}
      {modal3DProduct && (
        <ProductViewer3D
          product={modal3DProduct}
          isModal={true}
          onClose={() => setModal3DProduct(null)}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">CONTEMPORARY WOMEN'S WARDROBE</p>
          <h1 className="hero-title">SILHOUETTE & FORM</h1>
          <p className="hero-subtitle">
            Minimalist tops, plush knitwear, sculptural bags, and handcrafted hair accessories.
            Experience our pieces in interactive 3D before you buy.
          </p>
          <div className="hero-cta-group">
            <a href="#collection" className="btn btn-hero-primary">
              Shop Collection
            </a>
            <a href="#threed-studio" className="btn btn-hero-secondary">
              Launch 3D Studio
            </a>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="categories-section">
        <div className="section-header">
          <span className="section-eyebrow">SHOP BY CATEGORY</span>
          <h2>Explore The Collection</h2>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => {
                setActiveCategory(cat.id);
                const el = document.getElementById('collection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <img src={cat.image} alt={cat.name} className="category-img" />
              <div className="category-card-overlay">
                <h3>{cat.name}</h3>
                <span className="category-link-text">Explore {cat.name} →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Products Grid */}
      <section id="collection" className="collection-section">
        <div className="collection-header">
          <div>
            <span className="section-eyebrow">MACCROFI DESIGNS</span>
            <h2>Our Collection</h2>
          </div>

          {/* Filter Pills – Tops, Sweaters, Handbags, Hair Accessories */}
          <div className="filter-tabs">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'tops', label: 'Tops' },
              { id: 'sweaters', label: 'Sweaters' },
              { id: 'handbags', label: 'Handbags' },
              { id: 'hair-accessories', label: 'Hair Accessories' },
              { id: 'trending', label: 'Trending' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab-btn ${
                  activeCategory === tab.id ? 'is-active' : ''
                }`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
                {product.tag && (
                  <span className="product-badge">
                    {product.tag === 'bestseller' ? 'BESTSELLER' : 'POPULAR'}
                  </span>
                )}

                {/* 3D Trigger Badge */}
                <button
                  className="card-3d-badge-btn"
                  onClick={() => setModal3DProduct(product)}
                  title="View this product in 3D"
                >
                  <span>👁️ View in 3D</span>
                </button>

                <button
                  className="quick-add-btn"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  + Add to Bag
                </button>
              </div>

              <div className="product-meta">
                <span className="product-category">{product.category.replace('-', ' ')}</span>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price-row">
                  <span className="product-price">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <button
                    className="view-3d-text-link"
                    onClick={() => setModal3DProduct(product)}
                  >
                    ✦ 3D View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Three.js 3D Studio Section */}
      <section id="threed-studio" className="threed-studio-section">
        <div className="threed-studio-header">
          <span className="section-eyebrow">POWERED BY THREE.JS</span>
          <h2>MacCroFi 3D Interactive Studio</h2>
          <p>
            Rotate 360°, inspect textures under studio lighting, customize fabric colors,
            and examine our craftsmanship in real-time WebGL.
          </p>

          {/* Selector to switch 3D models */}
          <div className="threed-item-picker">
            {products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                className={`threed-picker-btn ${active3DProduct.id === p.id ? 'active' : ''}`}
                onClick={() => setActive3DProduct(p)}
              >
                {p.name} ({p.category.replace('-', ' ')})
              </button>
            ))}
          </div>
        </div>

        {/* Live 3D Scene */}
        <div className="threed-studio-embed">
          <ProductViewer3D
            key={active3DProduct.id}
            product={active3DProduct}
            isModal={false}
          />
        </div>
      </section>

      {/* Brand Values */}
      <section className="brand-values-section">
        <div className="value-item">
          <span className="value-icon">🌿</span>
          <h4>Conscious Materials</h4>
          <p>Soft pure cashmere, mulberry silks, and sustainably sourced leather.</p>
        </div>
        <div className="value-item">
          <span className="value-icon">✨</span>
          <h4>3D Fit Confidence</h4>
          <p>Inspect proportions and draping virtually before placing an order.</p>
        </div>
        <div className="value-item">
          <span className="value-icon">📦</span>
          <h4>Complimentary Shipping</h4>
          <p>Free express delivery on all orders over ₹2,499 with 14-day hassle-free returns.</p>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-card">
          <span className="section-eyebrow">DISCOUNTS & PROMOTIONS</span>
          <h2>Stay In The Loop</h2>
          <p>
            Register your email to receive <strong>10% off your first purchase</strong>, secret sales,
            and private invites to new product releases.
          </p>

          {newsletterStatus === 'success' ? (
            <div className="newsletter-success">
              <span>✓ You're signed up! Use promo code <strong>MACCROFI10</strong> at checkout for 10% off.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email for promotions"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </div>
              {newsletterStatus && (
                <p className="newsletter-error">{newsletterStatus}</p>
              )}
            </form>
          )}

          <p className="newsletter-disclaimer">
            Zero spam. You can unsubscribe at any time with a single click.
          </p>
        </div>
      </section>
    </div>
  );
}
