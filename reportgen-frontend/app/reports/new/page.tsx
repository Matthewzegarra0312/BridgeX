"use client";

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { generateReport, getReportQueries } from '@/services/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const reportFormSchema = z.object({
  queryType: z.string().min(1, 'Selecciona un tipo de consulta'),
  customQuery: z.string().optional(),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  recipients: z.array(z.string().email()).min(1, 'Agrega al menos un destinatario'),
  subject: z.string().min(1, 'El asunto es requerido'),
  reportType: z.enum(['PDF', 'HTML']),
  includeCharts: z.boolean(),
  attachCSV: z.boolean(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

const predefinedQueries = {
  ventas_diarias: 'Ventas Diarias',
  productos_top: 'Productos Top',
  clientes_activos: 'Clientes Activos',
  custom: 'Consulta Personalizada',
};

const recipientGroups = {
  finanzas: ['finanzas@empresa.com'],
  gerencia: ['gerencia@empresa.com', 'director@empresa.com'],
  analitica: ['analitica@empresa.com', 'bi@empresa.com'],
};

export default function NewReportPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const { data: availableQueries } = useQuery({
    queryKey: ['reportQueries'],
    queryFn: getReportQueries,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      queryType: '',
      customQuery: '',
      startDate: '',
      endDate: '',
      recipients: [],
      subject: 'Q1 2024: Financial Performance Summary',
      reportType: 'PDF',
      includeCharts: true,
      attachCSV: true,
    },
  });

  const watchedValues = watch();

  const generateMutation = useMutation({
    mutationFn: generateReport,
    onSuccess: (data) => {
      toast.success('Reporte generado y enviado exitosamente');
      router.push(`/reports/${data.report.type}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al generar el reporte');
    },
  });

  const onSubmit = (data: ReportFormData) => {
    const queryInfo = availableQueries?.[data.queryType];
    const query = data.queryType === 'custom' ? data.customQuery! : queryInfo?.sql || '';

    generateMutation.mutate({
      query,
      period: {
        start: `${data.startDate} 00:00:00`,
        end: `${data.endDate} 23:59:59`,
        label: `${data.startDate} - ${data.endDate}`,
      },
      recipients: data.recipients,
      reportType: data.reportType,
      includeCharts: data.includeCharts,
      attachCSV: data.attachCSV,
    });
  };

  const addEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      const currentRecipients = watchedValues.recipients || [];
      if (!currentRecipients.includes(emailInput)) {
        setValue('recipients', [...currentRecipients, emailInput]);
        setEmailInput('');
      }
    }
  };

  const removeEmail = (email: string) => {
    const currentRecipients = watchedValues.recipients || [];
    setValue('recipients', currentRecipients.filter(e => e !== email));
  };

  const toggleGroup = (groupKey: string) => {
    const groupEmails = recipientGroups[groupKey as keyof typeof recipientGroups];
    const currentRecipients = watchedValues.recipients || [];
    
    if (selectedGroups.includes(groupKey)) {
      // Remove group
      setSelectedGroups(selectedGroups.filter(g => g !== groupKey));
      setValue('recipients', currentRecipients.filter(email => !groupEmails.includes(email)));
    } else {
      // Add group
      setSelectedGroups([...selectedGroups, groupKey]);
      const newRecipients = [...new Set([...currentRecipients, ...groupEmails])];
      setValue('recipients', newRecipients);
    }
  };

  const setDatePreset = (preset: string) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (preset) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        endDate.setDate(today.getDate() - 1);
        break;
      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(today.getDate() - 30);
        break;
    }

    setValue('startDate', startDate.toISOString().split('T')[0]);
    setValue('endDate', endDate.toISOString().split('T')[0]);
  };

  return (
    <Layout
      title="Create New Report"
      subtitle="Configure and generate your custom report"
      action={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? 'Generating...' : 'Generate & Send'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Configuration */}
          <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Query Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select a saved query
                </label>
                <select
                  {...register('queryType')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select query...</option>
                  <option value="ventas_diarias">Q4 Financial Performance Summary</option>
                  <option value="productos_top">Weekly User Engagement</option>
                  <option value="clientes_activos">Monthly Revenue Analysis</option>
                  <option value="custom">Custom SQL Query</option>
                </select>
                {errors.queryType && (
                  <p className="mt-1 text-sm text-red-500">{errors.queryType.message}</p>
                )}
              </div>

              {watchedValues.queryType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom SQL Query
                  </label>
                  <textarea
                    {...register('customQuery')}
                    rows={6}
                    placeholder="-- Or write your own query here..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    {...register('startDate')}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    {...register('endDate')}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDatePreset('last7days')}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                  >
                    Last 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatePreset('last30days')}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatePreset('today')}
                    className="rounded-md bg-gray-700 px-3 py-1 text-xs text-white hover:bg-gray-600"
                  >
                    This Quarter
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatePreset('yesterday')}
                    className="rounded-md bg-gray-700 px-3 py-1 text-xs text-white hover:bg-gray-600"
                  >
                    This Year
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recipients</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter email addresses
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                    placeholder="john.doe@example.com"
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="button" onClick={addEmail} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Email Tags */}
                {watchedValues.recipients && watchedValues.recipients.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {watchedValues.recipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-sm text-white"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="hover:text-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Predefined recipient groups
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(recipientGroups).map(([key, emails]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(key)}
                        onChange={() => toggleGroup(key)}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Report Options */}
          <div className="rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Report Options</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 rounded-lg border ${watchedValues.reportType === 'PDF' ? 'border-blue-500 bg-blue-600' : 'border-gray-700 bg-gray-900'} px-4 py-3 cursor-pointer transition-colors`}>
                    <input
                      type="radio"
                      {...register('reportType')}
                      value="PDF"
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-white">● PDF</span>
                  </label>
                  <label className={`flex items-center justify-center gap-2 rounded-lg border ${watchedValues.reportType === 'HTML' ? 'border-blue-500 bg-blue-600' : 'border-gray-700 bg-gray-900'} px-4 py-3 cursor-pointer transition-colors`}>
                    <input
                      type="radio"
                      {...register('reportType')}
                      value="HTML"
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-white">○ HTML</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attachments
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('includeCharts')}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Include charts in email body</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('attachCSV')}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Attach raw data as CSV</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary">Test Query</Button>
              <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating...' : 'Generate & Send'}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg border border-gray-800 bg-[#0a0e1a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-gray-400 mb-1">FINAL SQL QUERY</h3>
                <div className="rounded-md bg-gray-900 p-3 font-mono text-xs text-gray-300">
                  {watchedValues.queryType === 'custom' && watchedValues.customQuery
                    ? watchedValues.customQuery
                    : '-- Q4 Financial Performance Summary\n\nSELECT\n  category,\n  SUM(revenue) as total_revenue,\n  COUNT(DISTINCT customer_id)\n\nFROM sales_data\n\nWHERE date BETWEEN \'2023-01-01\' AND\n\'2023-03-31\';\n\nGROUP BY category\n\nORDER BY total_revenue DESC;'}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-400 mb-1">RECIPIENTS LIST</h3>
                <ul className="space-y-1 text-gray-300">
                  {watchedValues.recipients && watchedValues.recipients.length > 0 ? (
                    watchedValues.recipients.map((email) => (
                      <li key={email}>• {email}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">No recipients added</li>
                  )}
                </ul>
                {selectedGroups.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Groups: {selectedGroups.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-400 mb-1">EMAIL SUBJECT</h3>
                <p className="text-gray-300">{watchedValues.subject || 'No subject'}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-400 mb-1">DATE RANGE</h3>
                <p className="text-gray-300">
                  {watchedValues.startDate && watchedValues.endDate
                    ? `${watchedValues.startDate} to ${watchedValues.endDate}`
                    : 'No date range selected'}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-400 mb-1">FORMAT</h3>
                <p className="text-gray-300">{watchedValues.reportType || 'PDF'}</p>
                <div className="mt-1 space-y-1 text-xs text-gray-400">
                  {watchedValues.includeCharts && <p>✓ Charts included</p>}
                  {watchedValues.attachCSV && <p>✓ CSV attachment</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
