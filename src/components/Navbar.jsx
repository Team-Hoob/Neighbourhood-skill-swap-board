import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

// Placeholder — will be replaced when Harshit Singh's Auth module is ready
const useMockAuth = () => ({
  user: null,
  signOut: () => {},
});

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useMockAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLinks = [
    { to: '/board',   label: 'Skill Board' },
    { to: '/matches', label: 'My Matches' },
    { to: '/post',    label: 'Post a Skill', highlight: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⟳</span>
          <span className="navbar__logo-text">
            Skill<span className="navbar__logo-accent">Swap</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links" aria-label="Main navigation">
          {navLinks.map(({ to, label, highlight }) => (
            <Link
              key={to}
              to={to}
              className={`navbar__link ${isActive(to) ? 'navbar__link--active' : ''} ${highlight ? 'navbar__link--highlight' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <Link to="/profile" className="navbar__avatar" title="My Profile">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} />
                  : <span>{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
                }
              </Link>
              <button onClick={signOut} className="navbar__signout">Sign out</button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__link">Log in</Link>
              <Link to="/register" className="navbar__btn-signup">Join Free</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="navbar__drawer-links">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`navbar__drawer-link ${isActive(to) ? 'navbar__drawer-link--active' : ''}`}>
              {label}
            </Link>
          ))}
          <hr className="navbar__drawer-divider" />
          {user ? (
            <button onClick={signOut} className="navbar__drawer-link">Sign out</button>
          ) : (
            <>
              <Link to="/login" className="navbar__drawer-link">Log in</Link>
              <Link to="/register" className="navbar__drawer-link navbar__drawer-link--cta">Join Free →</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
