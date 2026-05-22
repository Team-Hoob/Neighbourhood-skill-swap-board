import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">

        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-icon">⟳</span>
            <span>Skill<span className="footer__logo-accent">Swap</span></span>
          </Link>
          <p className="footer__tagline">
            Exchange skills with your neighbours.<br />
            No money needed — just community.
          </p>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__heading">Platform</h4>
          <ul className="footer__links">
            <li><Link to="/board" className="footer__link">Skill Board</Link></li>
            <li><Link to="/post" className="footer__link">Post a Skill</Link></li>
            <li><Link to="/matches" className="footer__link">My Matches</Link></li>
          </ul>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__heading">Account</h4>
          <ul className="footer__links">
            <li><Link to="/profile" className="footer__link">My Profile</Link></li>
            <li><Link to="/login" className="footer__link">Log In</Link></li>
            <li><Link to="/register" className="footer__link">Register</Link></li>
          </ul>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__heading">About</h4>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">How it Works</a></li>
            <li><a href="#" className="footer__link">Our Mission</a></li>
            <li><a href="#" className="footer__link">Contact</a></li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom container">
        <p className="footer__copy">
          © {new Date().getFullYear()} SkillSwap. Built with care for communities.
        </p>
        <p className="footer__credit">
          Made by a passionate team 🏘️
        </p>
      </div>
    </footer>
  );
}
