import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LinkShortener from '../components/LinkShortener';
import BrandLogo from '../components/BrandLogo';
import api from '../services/api';

export default function Home({ theme = 'light', onToggleTheme }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const isLoggedIn = useMemo(() => {
    return Boolean(localStorage.getItem('token'));
  }, []);

  const handleCreate = async (url) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/links/public', { url });
      const shortDomain = import.meta.env.VITE_SHORT_DOMAIN;
      const shortUrl = shortDomain && data.shortId ? `${shortDomain}/${data.shortId}` : data.shortUrl;
      setResult({ shortUrl, originalUrl: data.originalUrl });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <div className="w-full flex items-center justify-end">
            <button
              type="button"
              onClick={onToggleTheme}
              className="text-sm text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <div className="my-2">
            <BrandLogo variant="hero" asLink={false} />
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            Shorten any link without logging in. Sign in when you want your dashboard.
          </p>
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 text-white font-medium px-4 py-2 hover:bg-blue-700 transition"
              >
                Login
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="rounded-lg bg-blue-600 text-white font-medium px-4 py-2 hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </Link>
            )}
            <Link
              to="/register"
              className="rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Create account
            </Link>
          </div>
        </div>

        <LinkShortener onSubmit={handleCreate} loading={loading} error={error} showGreeting={false} />

        {result && (
          <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Your short link</p>
            <a
              href={result.shortUrl}
              className="block mt-2 text-lg font-semibold text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {result.shortUrl}
            </a>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {result.originalUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
