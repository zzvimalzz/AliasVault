import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getAliasMetadata, setAliasMetadata } from '../lib/storage';
import { useAliases } from '../hooks/useAliases';
import { Alias } from '../types';

export default function Dashboard() {
  const { aliases, loading, error, refresh } = useAliases();
  const [selectedAlias, setSelectedAlias] = useState<Alias | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState({
    local_part: '',
    domain: '',
    description: '',
    recipient_ids: [] as string[],
    url: '',
  });

  useEffect(() => {
    if (showCreateModal) {
      Promise.all([
        api.getRecipients().then(setRecipients),
        api.getDomains().then(setDomains),
      ]).catch(console.error);
    }
  }, [showCreateModal]);

  const handleToggleStatus = async (alias: Alias) => {
    try {
      if (alias.active) {
        await api.disableAlias(alias.id);
      } else {
        await api.enableAlias(alias.id);
      }
      refresh();
    } catch (err) {
      console.error('Failed to toggle alias status:', err);
    }
  };

  const handleDelete = async (alias: Alias) => {
    if (!confirm(`Delete alias ${alias.email}?`)) return;

    try {
      await api.deleteAlias(alias.id);
      refresh();
    } catch (err) {
      console.error('Failed to delete alias:', err);
    }
  };

  const handleCreateAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.createAlias(createForm);
      
      if (createForm.url && result.id) {
        const metadata = getAliasMetadata(result.id);
        setAliasMetadata(result.id, {
          ...metadata,
          url: createForm.url,
        });
      }
      
      setShowCreateModal(false);
      setCreateForm({
        local_part: '',
        domain: '',
        description: '',
        recipient_ids: [],
        url: '',
      });
      refresh();
    } catch (err) {
      console.error('Failed to create alias:', err);
      alert('Failed to create alias: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-primary border-r-transparent mb-4"></div>
          <p className="text-gray-400">Loading aliases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-6 max-w-md w-full">
          <div className="text-accent-danger text-center">
            <p className="font-semibold mb-2">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">AliasVault</h1>
              <span className="ml-4 text-sm text-gray-500">
                {aliases.length} {aliases.length === 1 ? 'alias' : 'aliases'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/settings"
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Settings
              </a>

              <div className="flex bg-dark-elevated rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    viewMode === 'table'
                      ? 'bg-accent-primary text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    viewMode === 'graph'
                      ? 'bg-accent-primary text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Graph
                </button>
              </div>

              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                + Create Alias
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'table' ? (
          <>
            {aliases.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-500">No aliases yet</p>
                <p className="text-sm text-gray-600 mt-2">
                  Create your first alias to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {aliases.map((alias) => {
                  const metadata = getAliasMetadata(alias.id);
                  return (
                    <div
                      key={alias.id}
                      className="card p-4 hover:border-accent-primary/30 transition-all hover:shadow-lg hover:shadow-accent-primary/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            alias.active
                              ? 'bg-accent-success/10 text-accent-success'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {alias.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="font-mono text-sm text-gray-200 break-all mb-1">
                          {alias.email}
                        </div>
                        {alias.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {alias.description}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-3 text-xs">
                        {metadata.service && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Service:</span>
                            <span className="text-gray-300">{metadata.service}</span>
                          </div>
                        )}
                        {metadata.category && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Category:</span>
                            <span className="text-gray-300">{metadata.category}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span className="text-gray-400">
                            {new Date(alias.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-dark-border">
                        <button
                          onClick={() => handleToggleStatus(alias)}
                          className="flex-1 text-xs py-1.5 px-2 rounded bg-dark-elevated hover:bg-accent-primary/10 text-accent-primary transition-colors"
                        >
                          {alias.active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(alias)}
                          className="flex-1 text-xs py-1.5 px-2 rounded bg-dark-elevated hover:bg-accent-danger/10 text-accent-danger transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="card p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Graph view coming soon</p>
              <p className="text-sm text-gray-600 mt-2">
                Visualize your alias network with Cytoscape.js
              </p>
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Alias</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlias} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Local Part (before @)
                </label>
                <input
                  type="text"
                  value={createForm.local_part}
                  onChange={(e) => setCreateForm({ ...createForm, local_part: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
                  placeholder="my-alias"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domain
                </label>
                <select
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
                  required
                >
                  <option value="">Select a domain...</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.domain}>
                      {domain.domain}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {domains.length === 1 ? '1 domain available' : `${domains.length} domains available`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
                  placeholder="What is this alias for?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={createForm.url}
                  onChange={(e) => setCreateForm({ ...createForm, url: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent-primary"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipients
                </label>
                <div className="bg-dark-elevated border border-dark-border rounded-lg p-3 max-h-[150px] overflow-y-auto">
                  {recipients.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No recipients available</p>
                  ) : (
                    <div className="space-y-2">
                      {recipients.map((recipient) => (
                        <label
                          key={recipient.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-dark-hover cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={createForm.recipient_ids.includes(recipient.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateForm({
                                  ...createForm,
                                  recipient_ids: [...createForm.recipient_ids, recipient.id],
                                });
                              } else {
                                setCreateForm({
                                  ...createForm,
                                  recipient_ids: createForm.recipient_ids.filter(
                                    (id) => id !== recipient.id
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 rounded bg-dark-surface border-dark-border text-accent-primary focus:ring-2 focus:ring-accent-primary"
                          />
                          <span className="text-sm text-gray-300 flex-1">{recipient.email}</span>
                          {createForm.recipient_ids.includes(recipient.id) && (
                            <span className="text-xs text-accent-primary">✓</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.recipient_ids.length === 0 
                    ? 'Select at least one recipient' 
                    : `${createForm.recipient_ids.length} selected`}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-elevated border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  Create Alias
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
