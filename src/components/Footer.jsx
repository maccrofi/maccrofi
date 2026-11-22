// Footer – women's fashion site footer with collection categories and customer care.
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <h3 className="footer-logo">MacCroFi</h3>
          <p className="footer-tagline">
            Contemporary women's fashion, knitwear, and accessories designed with pure materials and interactive 3D inspection.
          </p>
          <div className="footer-socials">
            <a href="#instagram" aria-label="Instagram">Instagram</a>
            <a href="#pinterest" aria-label="Pinterest">Pinterest</a>
            <a href="#twitter" aria-label="X">Twitter / X</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Collection</h4>
          <ul>
            <li><a href="#collection">Tops & Camisoles</a></li>
            <li><a href="#collection">Sweaters & Cardigans</a></li>
            <li><a href="#collection">Handbags & Clutches</a></li>
            <li><a href="#collection">Hair Accessories & Clips</a></li>
            <li><a href="#threed-studio">3D Interactive Studio</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><a href="#shipping">Complimentary Shipping</a></li>
            <li><a href="#returns">Returns & Exchanges (14 Days)</a></li>
            <li><a href="#size-guide">Interactive Size Guide</a></li>
            <li><a href="#contact">Contact Support</a></li>
            <li><Link to="/profile">My Account</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Brand</h4>
          <ul>
            <li><a href="#story">About MacCroFi</a></li>
            <li><a href="#sustainability">Conscious Tailoring</a></li>
            <li><a href="#press">Editorial Press</a></li>
            <li><a href="#careers">Careers</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MacCroFi. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookies">Cookie Preferences</a>
        </div>
      </div>
    </footer>
  );
}
