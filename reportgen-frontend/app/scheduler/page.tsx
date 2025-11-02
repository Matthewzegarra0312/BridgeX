"use client";

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Plus, Clock, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledReport {
  id: string;
  taskName: string;
  frequency: string;
  nextExecution: string;
  status: boolean;
}

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    taskName: 'Daily Sales Summary',
    frequency: 'Daily at 9:00 AM',
    nextExecution: 'Tomorrow at 9:00 AM',
    status: true,
  },
  {
    id: '2',
    taskName: 'Weekly Marketing Report',
    frequency: 'Weekly on Mon at 8:30 AM',
    nextExecution: 'Next Mon at 8:30 AM',
    status: true,
  },
  {
    id: '3',
    taskName: 'Monthly Financial Overview',
    frequency: 'Monthly on 1st at 12:00 PM',
    nextExecution: 'Next month, 1st at 12:00 PM',
    status: false,
  },
];

export default function SchedulerPage() {
  const [reports, setReports] = useState<ScheduledReport[]>(mockScheduledReports);

  const toggleStatus = (id: string) => {
    setReports(reports.map(report =>
      report.id === id ? { ...report, status: !report.status } : report
    ));
  };

  return (
    <Layout
      title="Scheduled Reports"
      subtitle="Manage, create, and view the history of your automated report tasks."
      action={
        <Button variant="primary" className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Schedule
        </Button>
      }
    >
      <div className="rounded-lg border border-gray-800 bg-[#0a0e1a]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Next Execution
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
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {report.taskName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {report.frequency}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {report.nextExecution}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(report.id)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        report.status ? 'bg-blue-600' : 'bg-gray-700'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          report.status ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
                        <Clock className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution History */}
      <div className="mt-6 rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Executions</h2>
        <div className="space-y-3">
          {[
            { task: 'Daily Sales Summary', time: '2 hours ago', status: 'success' },
            { task: 'Weekly Marketing Report', time: '1 day ago', status: 'success' },
            { task: 'Monthly Financial Overview', time: '2 days ago', status: 'failed' },
          ].map((execution, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 p-4"
            >
              <div>
                <p className="text-sm font-medium text-white">{execution.task}</p>
                <p className="text-xs text-gray-400">{execution.time}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  execution.status === 'success'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                )}
              >
                ● {execution.status === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
