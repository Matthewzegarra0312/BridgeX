"use client";

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Download, Send, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const kpiData = [
  {
    label: 'Total Sales',
    value: '$145,730',
    change: '+5.4%',
    trend: 'up' as const,
  },
  {
    label: 'New Customers',
    value: '850',
    change: '+12.1%',
    trend: 'up' as const,
  },
  {
    label: 'Units Sold',
    value: '2,430',
    change: '-1.2%',
    trend: 'down' as const,
  },
  {
    label: 'Avg. Order Value',
    value: '$60.05',
    change: '+2.6%',
    trend: 'up' as const,
  },
];

const salesTrendData = [
  { week: 'W1', value: 120000 },
  { week: 'W2', value: 135000 },
  { week: 'W3', value: 125000 },
  { week: 'W4', value: 145730 },
];

const channelData = [
  { channel: 'Organic', value: 320 },
  { channel: 'Paid', value: 280 },
  { channel: 'Referral', value: 180 },
  { channel: 'Direct', value: 70 },
];

const tableData = [
  {
    product: 'Apple Macbook Pro 14"',
    category: 'Laptop',
    unitsSold: 352,
    revenue: '$698,960',
    stock: 'In Stock',
  },
  {
    product: 'Microsoft Surface Pro',
    category: 'Laptop PC',
    unitsSold: 245,
    revenue: '$244,755',
    stock: 'In Stock',
  },
  {
    product: 'Magic Mouse 2',
    category: 'Accessories',
    unitsSold: 120,
    revenue: '$11,880',
    stock: 'Out of Stock',
  },
  {
    product: 'Apple Watch Series 7',
    category: 'Wearables',
    unitsSold: 560,
    revenue: '$223,440',
    stock: 'Low Stock',
  },
  {
    product: 'Dell XPS 15',
    category: 'Laptop',
    unitsSold: 198,
    revenue: '$283,311',
    stock: 'In Stock',
  },
];

export default function ReportResultsPage() {
  const progressSteps = [
    { label: 'Connecting to DB', completed: true },
    { label: 'Executing Query', completed: true },
    { label: 'Generating Report', completed: true },
    { label: 'Sending Emails', completed: true },
    { label: 'Completed', completed: true },
  ];

  return (
    <Layout
      title="Sales Report - Oct 25, 2023, 10:30 AM"
      subtitle="Showing the status of your report generation."
      action={
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
          <Button variant="secondary" className="gap-2">
            <Send className="h-4 w-4" />
            Resend Report
          </Button>
          <Button variant="primary" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
        </div>
      }
    >
      {/* Progress Indicator */}
      <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Generating Your Report...</h3>
        <div className="flex items-center justify-between">
          {progressSteps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step.completed ? 'bg-green-600' : 'bg-gray-700'}`}>
                  {step.completed ? (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                  )}
                </div>
                <span className={`mt-2 text-xs ${step.completed ? 'text-green-500' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < progressSteps.length - 1 && (
                <div className={`h-0.5 w-16 mx-2 ${step.completed ? 'bg-green-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <p className="text-sm font-medium text-gray-400">{kpi.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
              <span className={`flex items-center text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Sales Trend Chart */}
        <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Sales Trend - Last 30 Days</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-white">$145,730</p>
              <span className="text-sm text-green-500">Last 30 Days · +5.4%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Chart */}
        <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Customer Acquisition by Channel</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-white">850</p>
              <span className="text-sm text-green-500">Last 30 Days · +12.1%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="channel" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-gray-800 bg-[#0a0e1a]">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Full Report Data</h2>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search records..."
              className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-sm font-medium text-white">{row.product}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.unitsSold}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{row.revenue}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.stock === 'In Stock'
                          ? 'bg-green-500/10 text-green-500'
                          : row.stock === 'Out of Stock'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {row.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4">
          <p className="text-sm text-gray-400">Showing 1-5 of 100</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Previous</Button>
            <Button variant="secondary" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
