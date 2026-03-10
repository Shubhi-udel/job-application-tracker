'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import type { Application } from '@/types';
import { EditApplicationModal } from './EditApplicationModal';

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Interview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  Offer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
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

export function ApplicationCard({ application, statusOptions }: ApplicationCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusClass = STATUS_COLORS[application.status] ?? STATUS_COLORS.Applied;

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
      <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {application.jobTitle}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
            >
              {application.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{application.companyName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Applied {formatDate(application.applicationDate)}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
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
