'use client';

import { db } from '@/lib/db';
import { ApplicationList } from './ApplicationList';

export function Dashboard() {
  const user = db.useUser();

  const handleSignOut = () => {
    db.auth.signOut();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-100/60 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20" />
      <div className="pointer-events-none absolute top-32 -right-20 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl dark:bg-sky-900/20" />
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900 dark:text-indigo-300">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
            Student Productivity Tool
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4.25 3A2.25 2.25 0 002 5.25v9.5A2.25 2.25 0 004.25 17h11.5A2.25 2.25 0 0018 14.75v-9.5A2.25 2.25 0 0015.75 3H4.25zM3.5 6.5h13v8.25a.75.75 0 01-.75.75H4.25a.75.75 0 01-.75-.75V6.5zm3.25 2a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" />
              </svg>
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              Job Application Tracker
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Track and manage your job applications in one place.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          {user?.email && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <span className="sm:max-w-[220px] truncate">{user.email}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main>
        <ApplicationList />
      </main>
      </div>
    </div>
  );
}
