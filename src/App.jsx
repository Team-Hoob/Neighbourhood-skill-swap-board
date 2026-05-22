import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SkillBoardPage from './pages/SkillBoardPage';
import PostSkillPage from './pages/PostSkillPage';
import MyMatchesPage from './pages/MyMatchesPage';
import ProfilePage from './pages/ProfilePage';

// LoginPage & RegisterPage come from Harshit Singh's auth module (Module 2)
// Once he delivers them, import and add routes here:
//   import LoginPage    from './auth/LoginPage';
//   import RegisterPage from './auth/RegisterPage';
//   <Route path="/login"    element={<LoginPage />} />
//   <Route path="/register" element={<RegisterPage />} />

const AuthPlaceholder = ({ label }) => (
  <div style={{
    padding: '8rem 2rem 4rem',
    textAlign: 'center',
    fontFamily: 'var(--font-body)',
    color: 'var(--muted)',
  }}>
    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
      {label}
    </h2>
    <p>Coming from Harshit Singh's auth module 🔐</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/board"    element={<SkillBoardPage />} />
            <Route path="/post"     element={<PostSkillPage />} />
            <Route path="/matches"  element={<MyMatchesPage />} />
            <Route path="/profile"  element={<ProfilePage />} />
            <Route path="/login"    element={<AuthPlaceholder label="Login" />} />
            <Route path="/register" element={<AuthPlaceholder label="Register" />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
