import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './auth/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SkillBoardPage from './pages/SkillBoardPage';
import PostSkillPage from './pages/PostSkillPage';
import MyMatchesPage from './pages/MyMatchesPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              <Route path="/"         element={<HomePage />} />
              <Route path="/board"    element={<SkillBoardPage />} />
              <Route path="/post"     element={<PostSkillPage />} />
              <Route path="/matches"  element={<MyMatchesPage />} />
              <Route path="/profile"  element={<ProfilePage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}