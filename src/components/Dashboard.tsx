'use client';

import { db } from '@/lib/db';
import { ApplicationList } from './ApplicationList';

export function Dashboard() {
  const user = db.useUser();

  const handleSignOut = () => {
    db.auth.signOut();
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Job Application Tracker
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Track and manage your job applications in one place.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          {user?.email && (
            <p className="text-sm font-medium text-slate-600 sm:text-right dark:text-slate-300">
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main>
        <ApplicationList />
      </main>
    </div>
  );
}
