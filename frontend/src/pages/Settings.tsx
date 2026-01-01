import { useState } from 'react';
import { api } from '../lib/api';

export default function Settings() {
  const [form, setForm] = useState({
    admin_password: '',
    addy_api_key: '',
    jwt_secret: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const payload: any = {};
      
      if (form.admin_password) payload.admin_password = form.admin_password;
      if (form.addy_api_key) payload.addy_api_key = form.addy_api_key;
      if (form.jwt_secret) payload.jwt_secret = form.jwt_secret;

      if (Object.keys(payload).length === 0) {
        setError('Please enter at least one field to update');
        setLoading(false);
        return;
      }

      await api.updateSettings(payload);
      
      setSuccess(true);
      setForm({ admin_password: '', addy_api_key: '', jwt_secret: '' });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">Settings</h1>
            <a href="/dashboard" className="text-sm text-accent-primary hover:text-blue-400">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Update Credentials</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={form.admin_password}
                onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only enter if you want to change your password
              </p>
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
                placeholder="Leave blank to keep current key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get a new key from{' '}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                JWT Secret
              </label>
              <input
                type="password"
                value={form.jwt_secret}
                onChange={(e) => setForm({ ...form, jwt_secret: e.target.value })}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary font-mono text-sm"
                placeholder="Leave blank to keep current secret"
              />
              <p className="text-xs text-gray-500 mt-1">
                Advanced: Change JWT secret (will invalidate existing sessions)
              </p>
            </div>

            {error && (
              <div className="bg-accent-danger/10 border border-accent-danger/30 rounded-lg p-3">
                <p className="text-accent-danger text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-accent-success/10 border border-accent-success/30 rounded-lg p-3">
                <p className="text-accent-success text-sm">Settings updated successfully!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Settings'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-dark-elevated rounded-lg border border-dark-border">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Security Note:</strong> All credentials are
              encrypted and stored in Cloudflare KV. They never leave your worker instance
              and are not accessible to anyone except through authenticated API calls.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
