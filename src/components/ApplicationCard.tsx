'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import type { Application } from '@/types';
import { EditApplicationModal } from './EditApplicationModal';

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:ring-slate-600',
  Screening: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200 dark:bg-sky-900/50 dark:text-sky-200 dark:ring-sky-800',
  Interview: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:ring-blue-800',
  Offer: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:ring-emerald-800',
  Rejected: 'bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/50 dark:text-red-200 dark:ring-red-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/50 dark:text-red-200 dark:ring-red-800',
  Medium:
    'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:ring-amber-800',
  Low: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:ring-slate-600',
};

interface ApplicationCardProps {
  application: Application;
  statusOptions: readonly string[];
}

function formatDate(value: number | string): string {
  const ms = typeof value === 'string' ? new Date(value).getTime() : value;
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getFollowUpMs(value?: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const ms = typeof value === 'string' ? new Date(value).getTime() : value;
  return Number.isNaN(ms) ? null : ms;
}

export function ApplicationCard({ application, statusOptions }: ApplicationCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const statusClass = STATUS_COLORS[application.status] ?? STATUS_COLORS.Applied;
  const priorityClass = PRIORITY_COLORS[application.priority ?? 'Medium'] ?? PRIORITY_COLORS.Medium;
  const followUpMs = getFollowUpMs(application.followUpDate);
  const isFollowUpOverdue = followUpMs !== null && followUpMs < Date.now();
  const notesPreview = application.notes?.trim()
    ? application.notes.trim().slice(0, 120) + (application.notes.trim().length > 120 ? '…' : '')
    : null;

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    setDeleting(true);
    try {
      await db.transact(db.tx.applications[application.id].delete());
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <li
        className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 ${
          isFollowUpOverdue
            ? 'border-amber-300 ring-1 ring-amber-200 dark:border-amber-700 dark:ring-amber-800'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
                {application.jobTitle}
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {application.companyName}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
              >
                {application.status}
              </span>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}
              >
                {application.priority ?? 'Medium'} Priority
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Applied {formatDate(application.applicationDate)}</span>
            {followUpMs !== null && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Follow-up {formatDate(followUpMs)}</span>
              </>
            )}
            {application.progressTag && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {application.progressTag}
                </span>
              </>
            )}
          </div>

          {isFollowUpOverdue && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Follow-up reminder is overdue.
            </div>
          )}

          {application.jobLink && (
            <a
              href={application.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View Job Posting
            </a>
          )}

          {notesPreview && (
            <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              {notesPreview}
            </p>
          )}

          {showDetails && application.notes?.trim() && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {application.notes}
            </div>
          )}

          <div className="mt-1 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-3.5 py-1.5 text-sm font-medium text-red-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </li>

      {editOpen && (
        <EditApplicationModal
          application={application}
          statusOptions={statusOptions}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
