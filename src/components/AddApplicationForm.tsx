'use client';

import { useState } from 'react';
import { id } from '@instantdb/react';
import { db } from '@/lib/db';
import type {
  ApplicationPriority,
  ApplicationProgressTag,
  ApplicationStatus,
} from '@/types';

interface AddApplicationFormProps {
  size?: 'default' | 'large';
}

const PRIORITY_OPTIONS: ApplicationPriority[] = ['High', 'Medium', 'Low'];
const PROGRESS_OPTIONS: ApplicationProgressTag[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
];
const STATUS_OPTIONS: ApplicationStatus[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
];

function optionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function AddApplicationForm({ size = 'default' }: AddApplicationFormProps) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [applicationDate, setApplicationDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [followUpDate, setFollowUpDate] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [jobLink, setJobLink] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<ApplicationPriority>('Medium');
  const [progressTag, setProgressTag] = useState<ApplicationProgressTag | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = db.useUser();
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const dateMs = new Date(applicationDate).getTime();
    const newId = id();
    try {
      await db.transact(
        db.tx.applications[newId]
          .update({
            companyName: companyName.trim(),
            jobTitle: jobTitle.trim(),
            applicationDate: dateMs,
            followUpDate: followUpDate ? new Date(followUpDate).getTime() : null,
            status,
            jobLink: optionalString(jobLink),
            notes: optionalString(notes),
            priority,
            progressTag: progressTag || null,
            createdAt: Date.now(),
          })
          .link({ owner: user.id })
      );
      setCompanyName('');
      setJobTitle('');
      setApplicationDate(new Date().toISOString().slice(0, 10));
      setFollowUpDate('');
      setStatus('Applied');
      setJobLink('');
      setNotes('');
      setPriority('Medium');
      setProgressTag('');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {size === 'large' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <span className="text-xl leading-none">+</span>
          Add Application
        </button>
      ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <span className="text-lg leading-none">+</span>
        Add application
      </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Add job application</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="company" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Company name
                </label>
                <input
                  id="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label htmlFor="jobTitle" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Job title
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Software Engineer"
                  required
                />
              </div>
              <div>
                <label htmlFor="appDate" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Application date
                </label>
                <input
                  id="appDate"
                  type="date"
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label htmlFor="followUpDate" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Follow-up reminder date
                </label>
                <input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="jobLink" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Job link
                </label>
                <input
                  id="jobLink"
                  type="url"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="https://example.com/job-posting"
                />
              </div>
              <div>
                <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ApplicationPriority)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="progressTag" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Application progress tag
                </label>
                <select
                  id="progressTag"
                  value={progressTag}
                  onChange={(e) => setProgressTag(e.target.value as ApplicationProgressTag | '')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">None</option>
                  {PROGRESS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Personal notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Interview prep notes, recruiter details, salary info, reminders..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
