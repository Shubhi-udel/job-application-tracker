'use client';

import { db } from '@/lib/db';
import type { Application } from '@/types';
import { ApplicationCard } from './ApplicationCard';
import { AddApplicationForm } from './AddApplicationForm';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'] as const;

export function ApplicationList() {
  const { isLoading, error, data } = db.useQuery({
    applications: {},
  });

  const user = db.useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">
        Failed to load applications. Please try again.
      </div>
    );
  }

  const applications = ((data?.applications ?? []) as Application[]).sort((a, b) => {
    const dateA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
    const dateB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Your applications</h2>
        {user && <AddApplicationForm />}
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center dark:border-slate-600 dark:bg-slate-900/30">
          <p className="text-slate-600 dark:text-slate-400">No applications yet.</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
            Add your first job application above.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} statusOptions={STATUS_OPTIONS} />
          ))}
        </ul>
      )}
    </div>
  );
}
