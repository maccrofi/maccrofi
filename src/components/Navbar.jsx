// Navbar – women's luxury fashion navigation with categories and 3D studio link.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  function handleCategoryClick(e, categoryId) {
    if (window.location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById('collection');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('selectCategory', { detail: categoryId }));
    }
  }

  return (
    <header className="site-header">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <span>MACCROFI — WOMEN'S ESSENTIALS • FREE SHIPPING OVER ₹2,499 • INTERACTIVE 3D ACTIVE</span>
      </div>

      {/* Main Bar */}
      <nav className="navbar">
        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Brand Logo */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            MacCroFi
          </Link>
        </div>

        {/* Women's Fashion Categories */}
        <div className={`navbar-categories ${mobileMenuOpen ? 'is-open' : ''}`}>
          <Link
            to="/#collection"
            onClick={(e) => handleCategoryClick(e, 'all')}
          >
            All Pieces
          </Link>
          <Link
            to="/#tops"
            onClick={(e) => handleCategoryClick(e, 'tops')}
          >
            Tops
          </Link>
          <Link
            to="/#sweaters"
            onClick={(e) => handleCategoryClick(e, 'sweaters')}
          >
            Sweaters
          </Link>
          <Link
            to="/#handbags"
            onClick={(e) => handleCategoryClick(e, 'handbags')}
          >
            Handbags
          </Link>
          <Link
            to="/#hair-accessories"
            onClick={(e) => handleCategoryClick(e, 'hair-accessories')}
          >
            Hair Accessories
          </Link>
          <a
            href="#threed-studio"
            onClick={() => setMobileMenuOpen(false)}
            className="highlight-link"
          >
            ✦ 3D Studio
          </a>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-nav-group">
              <Link to="/profile" className="nav-action-btn" title="Profile">
                <span className="nav-action-icon">👤</span>
                <span className="nav-action-label">Account</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-link nav-logout-btn"
                title="Log Out"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-action-btn" title="Sign In">
              <span className="nav-action-icon">👤</span>
              <span className="nav-action-label">Sign In</span>
            </Link>
          )}

          {/* Cart Icon */}
          <button
            onClick={toggleCart}
            className="nav-action-btn cart-badge-btn"
            aria-label="View Shopping Bag"
          >
            <span className="nav-action-icon">🛍️</span>
            <span className="nav-action-label">Bag</span>
            {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
          </button>
        </div>
      </nav>
    </header>
  );
}
