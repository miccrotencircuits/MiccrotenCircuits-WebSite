import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Phone } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { supabase } from '../supabaseClient';
import 'react-phone-number-input/style.css';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <section className="bg-slate-50 min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-navy-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccess(false);

            if (password !== confirmPassword) {
              setError('Passwords do not match.');
              setLoading(false);
              return;
            }

            if (!phone || !isValidPhoneNumber(phone)) {
              setError('Please enter a valid phone number.');
              setLoading(false);
              return;
            }

            try {
              const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  emailRedirectTo: `${window.location.origin}/login`,
                  data: {
                    full_name: fullName,
                    phone: phone,
                  },
                },
              });

              if (signUpError) throw signUpError;

              if (!data.user) {
                throw new Error('Signup was successful, but no user object was returned. Please check your email to verify.');
              }

              setSuccess(true);
            } catch (error: any) {
              let friendlyMessage = 'An unexpected error occurred. Please try again.';
              if (error.message.includes('User already registered')) {
                friendlyMessage = 'An account with this email address already exists.';
              } else if (error.message.includes('Password should be at least 6 characters')) {
                friendlyMessage = 'The password is too weak. It must be at least 6 characters long.';
              }
              setError(friendlyMessage);
            }
            setLoading(false);
          }}
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="full-name" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Full Name"
                />
              </div>
            </div>
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
            <div>
              <label htmlFor="phone-number" className="sr-only">Phone Number</label>
              <div className="relative">
                <PhoneInput
                  id="phone-number"
                  international
                  defaultCountry="IN"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={setPhone}
                  limitMaxLength
                  required
                  className="custom-phone-input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password-sr" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password-sr"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Password"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password-sr" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="confirm-password-sr"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 pl-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg" role="alert">
              <p>Success! A verification link has been sent to your email address. Please verify your email to log in.</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-500 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}