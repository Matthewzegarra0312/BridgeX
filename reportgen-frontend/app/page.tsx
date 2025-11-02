"use client";

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Plus, TrendingUp, TrendingDown, Database, Mail, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getConnectionStatus, getReportHistory } from '@/services/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data: connectionStatus } = useQuery({
    queryKey: ['connectionStatus'],
    queryFn: getConnectionStatus,
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  const { data: recentReports } = useQuery({
    queryKey: ['recentReports'],
    queryFn: getReportHistory,
  });

  const stats = [
    {
      label: 'Reports Today',
      value: '12',
      icon: TrendingUp,
      trend: { value: '+5.4%', positive: true },
    },
  ];

  return (
    <Layout
      title="Dashboard"
      subtitle="An overview of your reporting activity and system status."
      action={
        <Link href="/reports/new">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        </Link>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Reports Today */}
        <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Reports Today</p>
              <p className="mt-2 text-3xl font-bold text-white">12</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+5.4%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* MySQL Connection */}
        <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">MySQL Connection</p>
              <p className={cn(
                "mt-2 text-lg font-semibold",
                connectionStatus?.mysql.connected ? "text-green-500" : "text-red-500"
              )}>
                {connectionStatus?.mysql.connected ? '● Connected' : '● Disconnected'}
              </p>
              {connectionStatus?.mysql.host && (
                <p className="mt-1 text-xs text-gray-500">{connectionStatus.mysql.host}</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Gmail Connection */}
        <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Gmail Connection</p>
              <p className={cn(
                "mt-2 text-lg font-semibold",
                connectionStatus?.gmail.authenticated ? "text-green-500" : "text-red-500"
              )}>
                {connectionStatus?.gmail.authenticated ? '● Connected' : '● Disconnected'}
              </p>
              {connectionStatus?.gmail.email && (
                <p className="mt-1 text-xs text-gray-500">{connectionStatus.gmail.email}</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
              <Mail className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Last Sent */}
        <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Last Sent</p>
              <p className="mt-2 text-lg font-semibold text-white">2 hours ago</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Send className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-6 rounded-lg border border-gray-800 bg-[#0a0e1a]">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
          <div className="flex gap-2">
            <select className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Today</option>
            </select>
            <select className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Type: All</option>
              <option>PDF</option>
              <option>CSV</option>
              <option>Excel</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Generation Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentReports?.map((report) => (
                <tr key={report.id} className="hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {report.reportName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {report.generationDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {report.type}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      report.status === 'success' && "bg-green-500/10 text-green-500",
                      report.status === 'failed' && "bg-red-500/10 text-red-500",
                      report.status === 'in-progress' && "bg-yellow-500/10 text-yellow-500"
                    )}>
                      ● {report.status === 'success' ? 'Success' : report.status === 'failed' ? 'Failed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button className="text-gray-400 hover:text-white">
                      ···
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
