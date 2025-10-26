import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      // To prevent user enumeration, we show a success message even if the user does not exist.
      setSuccess(true);
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-navy-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
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
          </div>

          {error && (
            <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg mt-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg mt-4" role="alert">
              <p>Password reset link sent! Please check your email inbox (and spam folder).</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-500 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 mr-2" />
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>
          <div className="text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">Back to Login</Link>
          </div>
        </form>
      </div>
    </section>
  );
}