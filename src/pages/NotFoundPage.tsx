import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="bg-slate-50 min-h-screen flex items-center justify-center text-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md">
        <AlertTriangle className="w-24 h-24 text-orange-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-navy-900">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          Page Not Found
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10">
          <Link to="/" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-orange-500/30">
            <Home className="w-5 h-5" /> Go back home
          </Link>
        </div>
      </div>
    </section>
  );
}