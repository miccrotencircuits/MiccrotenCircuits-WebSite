import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', href: '/', type: 'route' },
    { name: 'PCB Quotation', href: '/pcb-quotation', type: 'route' },
    { name: 'Assembly Quotation', href: '/assembly-quotation', type: 'route' },
    { name: 'Contact', href: '/contact', type: 'route' },
  ];
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-navy-900 shadow-lg backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Miccroten Circuits Logo" className="w-24" />
            <span className="text-2xl font-bold text-white">
              Miccroten<span className="text-orange-500">Circuits</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-slate-200 hover:text-orange-500 transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="text-slate-200 hover:text-orange-500 transition-colors duration-200 font-medium">Profile</Link>
                {user.email === 'miccrotencircuits@gmail.com' && (
                  <Link to="/admin" className="text-slate-200 hover:text-orange-500 transition-colors duration-200 font-medium">Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-orange-500/20"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-orange-500/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-orange-500 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-navy-800">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-200 hover:bg-navy-700 hover:text-orange-500 px-3 py-2 rounded-md font-medium"
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-navy-700 pt-4 space-y-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-200 hover:bg-navy-700 hover:text-orange-500 px-3 py-2 rounded-md font-medium">Profile</Link>
                  {user.email === 'miccrotencircuits@gmail.com' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-200 hover:bg-navy-700 hover:text-orange-500 px-3 py-2 rounded-md font-medium">Admin</Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full text-left bg-orange-500 hover:bg-orange-600 text-white px-3 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center bg-orange-500 hover:bg-orange-600 text-white px-3 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-orange-500/20"
                  >
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block text-center bg-orange-500 hover:bg-orange-600 text-white px-3 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-orange-500/20">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
