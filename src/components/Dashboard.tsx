'use client';

import Link from 'next/link';
import { db } from '@/lib/db';
import { ApplicationList } from './ApplicationList';

export function Dashboard() {
  const user = db.useUser();

  const handleSignOut = () => {
    db.auth.signOut();
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Job Application Tracker
          </h1>
          {user?.email && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
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
