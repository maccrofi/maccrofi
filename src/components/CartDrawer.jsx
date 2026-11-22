// CartDrawer – slide-out shopping bag drawer from the right side.
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    deleteFromCart,
  } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 2499;
  const progressToFreeShipping = Math.min(
    100,
    (cartTotal / freeShippingThreshold) * 100
  );

  function handleCheckout() {
    closeCart();
    if (!currentUser) {
      navigate('/login?redirect=checkout');
    } else {
      alert('Checkout process initiated! Payment gateway integration coming soon.');
    }
  }

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h3>Shopping Bag ({cartCount})</h3>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="free-shipping-bar">
          {cartTotal >= freeShippingThreshold ? (
            <p className="shipping-unlocked">✨ You unlocked complimentary express shipping!</p>
          ) : (
            <p>
              Add ₹{(freeShippingThreshold - cartTotal).toLocaleString('en-IN')} more to unlock{' '}
              <strong>Free Shipping</strong>
            </p>
          )}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <span className="cart-empty-icon">🛍️</span>
              <p>Your bag is currently empty.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  closeCart();
                  const target = document.getElementById('collection');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <div className="cart-item-title-row">
                    <span className="cart-item-name">{item.name}</span>
                    <button
                      className="cart-item-remove"
                      onClick={() => deleteFromCart(item.id)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="cart-item-cat">{item.category}</span>
                  <div className="cart-item-price-row">
                    <span className="cart-item-price">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <div className="qty-controls">
                      <button onClick={() => removeFromCart(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart(item, false)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Subtotal */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal</span>
              <span className="cart-subtotal-amount">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="cart-tax-notice">Taxes and shipping calculated at checkout.</p>
            <button className="btn btn-primary btn-checkout" onClick={handleCheckout}>
              {currentUser ? 'Checkout' : 'Checkout as Guest / Sign In'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
