'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { Application } from '@/types';

interface EditApplicationModalProps {
  application: Application;
  statusOptions: readonly string[];
  onClose: () => void;
}

function formatDateForInput(value: number | string): string {
  const ms = typeof value === 'string' ? new Date(value).getTime() : value;
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
}

export function EditApplicationModal({
  application,
  statusOptions,
  onClose,
}: EditApplicationModalProps) {
  const [companyName, setCompanyName] = useState(application.companyName);
  const [jobTitle, setJobTitle] = useState(application.jobTitle);
  const [applicationDate, setApplicationDate] = useState(() =>
    formatDateForInput(application.applicationDate)
  );
  const [status, setStatus] = useState(application.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCompanyName(application.companyName);
    setJobTitle(application.jobTitle);
    setApplicationDate(formatDateForInput(application.applicationDate));
    setStatus(application.status);
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const dateMs = new Date(applicationDate).getTime();
    try {
      await db.transact(
        db.tx.applications[application.id].update({
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          applicationDate: dateMs,
          status,
        })
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Edit application</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="edit-company"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Company name
            </label>
            <input
              id="edit-company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label
              htmlFor="edit-jobTitle"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Job title
            </label>
            <input
              id="edit-jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label
              htmlFor="edit-appDate"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Application date
            </label>
            <input
              id="edit-appDate"
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label
              htmlFor="edit-status"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
