import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-navy-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
              create a new account
            </Link>
          </p>
        </div>
        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const { data, error } = await supabase.auth.signInWithPassword({ email, password });

              if (error) throw error;

              if (data.user?.email === 'miccrotencircuits@gmail.com') {
                navigate('/admin');
              } else {
                navigate('/profile');
              }
            } catch (error: any) {
              let friendlyMessage = 'Invalid email or password. Please try again.';
              if (error.message.includes('Email not confirmed')) {
                friendlyMessage = 'Your email is not verified. Please check your inbox for a verification link.';
              }
              setError(friendlyMessage);
            }
            setLoading(false);
          }}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="pt-4">
              <label htmlFor="password-sr" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password-sr"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-500 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}