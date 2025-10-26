import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PCBQuotationPage from './pages/PCBQuotationPage';
import AssemblyQuotationPage from './pages/AssemblyQuotationPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AuthProvider } from './AuthContext';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/pcb-quotation" element={<PCBQuotationPage />} />
              <Route path="/assembly-quotation" element={<AssemblyQuotationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
