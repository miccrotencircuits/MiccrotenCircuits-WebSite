import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase uses a hash parameter for the access token
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // remove '#'
    const accessToken = params.get('access_token');

    if (!accessToken) {
      setError('Password reset token is missing or invalid. Please request a new link.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred. Please try again.';
      switch (err.code) {
        case 'expired_token':
          friendlyMessage = 'This password reset link has expired. Please request a new one.';
          break;
        case 'invalid_token':
          friendlyMessage = 'This password reset link is invalid or has already been used. Please request a new one.';
          break;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-navy-900">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your new password below.
          </p>
        </div>
        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="New Password"
                />
              </div>
            </div>
            <div className="pt-4">
              <label htmlFor="confirm-new-password" className="sr-only">Confirm New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="confirm-new-password"
                  name="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm New Password"
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
              <p className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Password has been reset successfully! Redirecting to login...</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-500 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
