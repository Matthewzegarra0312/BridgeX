"use client";

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Database, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getConnectionStatus } from '@/services/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('connections');
  const [mysqlConfig, setMysqlConfig] = useState({
    host: 'localhost',
    port: '3306',
    database: 'reportes_db',
    user: 'root',
    password: '',
  });
  const [gmailConfig, setGmailConfig] = useState({
    serviceAccountEmail: '',
    serviceAccountPrivateKey: '',
    impersonateEmail: '',
  });

  const { data: connectionStatus, refetch } = useQuery({
    queryKey: ['connectionStatus'],
    queryFn: getConnectionStatus,
  });

  const saveMysqlMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/config/mysql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mysqlConfig),
      });
      if (!response.ok) throw new Error('Failed to save MySQL config');
      return response.json();
    },
    onSuccess: () => {
      toast.success('MySQL configuration saved successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save MySQL configuration: ${error.message}`);
    },
  });

  const saveGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/config/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gmailConfig),
      });
      if (!response.ok) throw new Error('Failed to save Gmail config');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Gmail configuration saved successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save Gmail configuration: ${error.message}`);
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (type: 'mysql' | 'gmail') => {
      const endpoint = type === 'mysql' ? '/api/test/mysql' : '/api/test/gmail';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'mysql' ? mysqlConfig : gmailConfig),
      });
      if (!response.ok) throw new Error('Connection test failed');
      return response.json();
    },
    onSuccess: (data, type) => {
      toast.success(`${type === 'mysql' ? 'MySQL' : 'Gmail'} connection test successful`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Connection test failed: ${error.message}`);
    },
  });

  const tabs = [
    { id: 'connections', label: 'Connections' },
    { id: 'recipients', label: 'Recipient Groups' },
    { id: 'queries', label: 'Saved Queries' },
  ];

  return (
    <Layout
      title="Settings"
      subtitle="Configure connections, manage recipient groups, and save custom queries."
    >
      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <nav className="-mb-px flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Manage Connections</h2>

          {/* MySQL Connection */}
          <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Database className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">MySQL Database</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      {connectionStatus?.mysql.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={connectionStatus?.mysql.connected ? 'text-green-500' : 'text-red-500'}>
                        {connectionStatus?.mysql.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    {connectionStatus?.mysql.host && (
                      <>
                        <p className="text-sm text-gray-400">Host: {connectionStatus.mysql.host}</p>
                        <p className="text-sm text-gray-400">Database: {connectionStatus.mysql.database}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => testConnectionMutation.mutate('mysql')}
                disabled={testConnectionMutation.isPending}
              >
                {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {/* Configuration Form */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-800 pt-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Host</label>
                <input
                  type="text"
                  value={mysqlConfig.host}
                  onChange={(e) => setMysqlConfig({ ...mysqlConfig, host: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={mysqlConfig.port}
                  onChange={(e) => setMysqlConfig({ ...mysqlConfig, port: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Database</label>
                <input
                  type="text"
                  value={mysqlConfig.database}
                  onChange={(e) => setMysqlConfig({ ...mysqlConfig, database: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
                <input
                  type="text"
                  value={mysqlConfig.user}
                  onChange={(e) => setMysqlConfig({ ...mysqlConfig, user: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={mysqlConfig.password}
                  onChange={(e) => setMysqlConfig({ ...mysqlConfig, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <Button 
                  variant="primary"
                  onClick={() => saveMysqlMutation.mutate()}
                  disabled={saveMysqlMutation.isPending}
                >
                  {saveMysqlMutation.isPending ? 'Saving...' : 'Save MySQL Configuration'}
                </Button>
              </div>
            </div>
          </div>

          {/* Gmail API */}
          <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Gmail API (OAuth2)</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      {connectionStatus?.gmail.authenticated ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={connectionStatus?.gmail.authenticated ? 'text-green-500' : 'text-red-500'}>
                        {connectionStatus?.gmail.authenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    {connectionStatus?.gmail.email && (
                      <p className="text-sm text-gray-400">Authenticated as: {connectionStatus.gmail.email}</p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => testConnectionMutation.mutate('gmail')}
                disabled={testConnectionMutation.isPending}
              >
                {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {/* Gmail Configuration Form */}
            <div className="mt-6 border-t border-gray-800 pt-6">
              <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-semibold mb-1">Google Cloud Service Account Required</p>
                  <p>Upload your Service Account JSON file or paste credentials to enable Gmail API integration.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service Account Email</label>
                  <input
                    type="email"
                    value={gmailConfig.serviceAccountEmail}
                    onChange={(e) => setGmailConfig({ ...gmailConfig, serviceAccountEmail: e.target.value })}
                    placeholder="example@project.iam.gserviceaccount.com"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service Account Private Key</label>
                  <textarea
                    value={gmailConfig.serviceAccountPrivateKey}
                    onChange={(e) => setGmailConfig({ ...gmailConfig, serviceAccountPrivateKey: e.target.value })}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    rows={6}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Impersonate Email</label>
                  <input
                    type="email"
                    value={gmailConfig.impersonateEmail}
                    onChange={(e) => setGmailConfig({ ...gmailConfig, impersonateEmail: e.target.value })}
                    placeholder="user@company.com or service-account@project.iam.gserviceaccount.com"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="primary"
                    onClick={() => saveGmailMutation.mutate()}
                    disabled={saveGmailMutation.isPending}
                  >
                    {saveGmailMutation.isPending ? 'Saving...' : 'Save Gmail Configuration'}
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => testConnectionMutation.mutate('gmail')}
                    disabled={testConnectionMutation.isPending}
                  >
                    Test After Saving
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Groups Tab */}
      {activeTab === 'recipients' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recipient Groups</h2>
            <Button variant="primary">Add New Group</Button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Executive Team', emails: ['john.doe@example.com', 's.jones@company.dev'] },
              { name: 'Sales Leadership', emails: ['s.jones@company.dev'] },
              { name: 'Data Science Dept.', emails: [] },
              { name: 'Marketing Analytics', emails: [] },
            ].map((group, index) => (
              <div key={index} className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                    {group.emails.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.emails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center rounded-md bg-blue-600/20 px-2.5 py-1 text-sm text-blue-400"
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No emails configured</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Queries Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Saved Queries</h2>
            <Button variant="primary">Add New Query</Button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Q4 Financial Performance Summary', query: 'SELECT category, SUM(revenue)...' },
              { name: 'Weekly User Engagement', query: 'SELECT DATE(created_at), COUNT(*)...' },
              { name: 'Monthly Revenue Analysis', query: 'SELECT MONTH(order_date), SUM(total)...' },
            ].map((savedQuery, index) => (
              <div key={index} className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{savedQuery.name}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </div>
                <div className="rounded-md bg-gray-900 p-4 font-mono text-sm text-gray-300">
                  {savedQuery.query}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
