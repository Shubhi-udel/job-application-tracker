'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const router = useRouter();
  const { isLoading, user, error } = db.useAuth();

  useEffect(() => {
    if (!isLoading && !user && !error) {
      router.replace('/login');
    }
  }, [isLoading, user, error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-red-600 dark:text-red-400">
          Something went wrong. Please try again.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <p className="text-center text-slate-600 dark:text-slate-400">
          You need to sign in to view your dashboard.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return <Dashboard />;
}
