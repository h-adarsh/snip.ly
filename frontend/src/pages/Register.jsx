import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Very Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Weak', color: 'bg-orange-500' },
      { strength: 3, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 4, label: 'Good', color: 'bg-lime-500' },
      { strength: 5, label: 'Strong', color: 'bg-green-500' }
    ];

    return { ...levels[strength], checks };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (passwordStrength.strength < 4) {
      return setError('Password is too weak. Please use a stronger password.');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { 
        name: form.name,
        email: form.email, 
        password: form.password 
      });
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      const errors = err.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        setError(errors.join('. '));
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo variant="auth" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">Create account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Your name"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 pr-16 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password strength indicator */}
              {form.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.strength ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {passwordStrength.label && `Strength: ${passwordStrength.label}`}
                  </p>
                  <ul className="text-xs space-y-1">
                    <li className={passwordStrength.checks?.length ? 'text-green-600' : 'text-slate-500 dark:text-slate-400'}>
                      {passwordStrength.checks?.length ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={passwordStrength.checks?.uppercase ? 'text-green-600' : 'text-slate-500 dark:text-slate-400'}>
                      {passwordStrength.checks?.uppercase ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={passwordStrength.checks?.lowercase ? 'text-green-600' : 'text-slate-500 dark:text-slate-400'}>
                      {passwordStrength.checks?.lowercase ? '✓' : '○'} One lowercase letter
                    </li>
                    <li className={passwordStrength.checks?.number ? 'text-green-600' : 'text-slate-500 dark:text-slate-400'}>
                      {passwordStrength.checks?.number ? '✓' : '○'} One number
                    </li>
                    <li className={passwordStrength.checks?.special ? 'text-green-600' : 'text-slate-500 dark:text-slate-400'}>
                      {passwordStrength.checks?.special ? '✓' : '○'} One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm password</label>
              <div className="relative">
                <input
                  type={showPwd2 ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 pr-16 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPwd2 ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || passwordStrength.strength < 4}
              className="w-full rounded-lg bg-blue-600 text-white font-medium py-2 transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
            Already have an account?{' '}
            <Link className="text-blue-600 hover:underline" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}