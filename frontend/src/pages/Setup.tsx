import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    admin_password: '',
    confirm_password: '',
    addy_api_key: '',
    jwt_secret: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generateSecret, setGenerateSecret] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.admin_password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (form.admin_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!form.addy_api_key.startsWith('addy_io_')) {
      setError('Invalid Addy.io API key format');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        admin_password: form.admin_password,
        addy_api_key: form.addy_api_key,
      };

      if (!generateSecret && form.jwt_secret) {
        payload.jwt_secret = form.jwt_secret;
      }

      const result = await api.initialize(payload);
      
      if (result.token) {
        api.setToken(result.token);
      }

      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AliasVault Setup</h1>
          <p className="text-gray-400 text-sm">
            Welcome! Let's get you set up in just a few steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={form.admin_password}
              onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
              placeholder="Choose a strong password"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Addy.io API Key
            </label>
            <input
              type="password"
              value={form.addy_api_key}
              onChange={(e) => setForm({ ...form, addy_api_key: e.target.value })}
              className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary font-mono text-sm"
              placeholder="addy_io_..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from{' '}
              <a
                href="https://app.addy.io/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                Addy.io Settings
              </a>
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={generateSecret}
                onChange={(e) => setGenerateSecret(e.target.checked)}
                className="w-4 h-4 rounded bg-dark-elevated border-dark-border text-accent-primary"
              />
              <span className="text-gray-300">Auto-generate JWT secret (recommended)</span>
            </label>
          </div>

          {!generateSecret && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                JWT Secret (optional)
              </label>
              <input
                type="text"
                value={form.jwt_secret}
                onChange={(e) => setForm({ ...form, jwt_secret: e.target.value })}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary font-mono text-sm"
                placeholder="Custom JWT secret"
              />
            </div>
          )}

          {error && (
            <div className="bg-accent-danger/10 border border-accent-danger/30 rounded-lg p-3">
              <p className="text-accent-danger text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-dark-elevated rounded-lg border border-dark-border">
          <p className="text-xs text-gray-400">
            <strong className="text-gray-300">Note:</strong> Your credentials are stored
            securely in Cloudflare KV and never leave your worker instance.
          </p>
        </div>
      </div>
    </div>
  );
}
