'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import type { Application, ApplicationStatus } from '@/types';
import { ApplicationCard } from './ApplicationCard';
import { AddApplicationForm } from './AddApplicationForm';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
];
const STATUS_SORT_ORDER: Record<string, number> = {
  Applied: 0,
  Screening: 1,
  Interview: 2,
  Offer: 3,
  Rejected: 4,
};
type SortOption = 'newest' | 'oldest' | 'status';
type ViewMode = 'list' | 'pipeline';

export function ApplicationList() {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedApplicationId, setDraggedApplicationId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

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

  const applications = [...((data?.applications ?? []) as Application[])].sort((a, b) => {
    const dateA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
    const dateB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();

    if (sortBy === 'oldest') {
      return dateA - dateB;
    }

    if (sortBy === 'status') {
      const statusDelta =
        (STATUS_SORT_ORDER[a.status] ?? Number.MAX_SAFE_INTEGER) -
        (STATUS_SORT_ORDER[b.status] ?? Number.MAX_SAFE_INTEGER);
      return statusDelta !== 0 ? statusDelta : dateB - dateA;
    }

    return dateB - dateA;
  });
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredApplications = applications.filter((app) => {
    if (!normalizedSearch) return true;
    return (
      app.companyName.toLowerCase().includes(normalizedSearch) ||
      app.jobTitle.toLowerCase().includes(normalizedSearch)
    );
  });
  const totalApplications = applications.length;
  const interviewCount = applications.filter((app) => app.status === 'Interview').length;
  const offerCount = applications.filter((app) => app.status === 'Offer').length;
  const responseRate = totalApplications
    ? Math.round((interviewCount / totalApplications) * 100)
    : 0;

  const handleDropToStatus = async (nextStatus: ApplicationStatus) => {
    if (!draggedApplicationId) return;
    const target = applications.find((app) => app.id === draggedApplicationId);
    if (!target || target.status === nextStatus) {
      setDraggedApplicationId(null);
      return;
    }

    setUpdatingStatusId(draggedApplicationId);
    try {
      await db.transact(
        db.tx.applications[draggedApplicationId].update({
          status: nextStatus,
        })
      );
    } finally {
      setUpdatingStatusId(null);
      setDraggedApplicationId(null);
      setDragOverStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Your applications</h2>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {applications.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'pipeline'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Pipeline View
            </button>
          </div>
          <label htmlFor="sort-applications" className="text-sm text-slate-600 dark:text-slate-400">
            Sort by
          </label>
          <select
            id="sort-applications"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="status">Status</option>
          </select>
          {user && <AddApplicationForm />}
        </div>
      </div>

      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by company or job title"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
        />
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Job Search Insights
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Applications
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalApplications}
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm dark:border-blue-900 dark:bg-blue-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Interviews
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-200">
              {interviewCount}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Offers
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              {offerCount}
            </p>
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm dark:border-violet-900 dark:bg-violet-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
              Response Rate
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-900 dark:text-violet-200">
              {responseRate}%
            </p>
          </div>
        </div>
      </section>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-900/30">
          <p className="text-base font-medium text-slate-700 dark:text-slate-300">
            You haven&apos;t added any applications yet.
          </p>
          <div className="mt-6 flex justify-center">
            <AddApplicationForm size="large" />
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center dark:border-slate-600 dark:bg-slate-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No applications match your search.
          </p>
        </div>
      ) : viewMode === 'pipeline' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STATUS_OPTIONS.map((status) => {
            const columnItems = filteredApplications.filter((app) => app.status === status);
            return (
              <section
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOverStatus(status)}
                onDragLeave={() => setDragOverStatus((prev) => (prev === status ? null : prev))}
                onDrop={() => handleDropToStatus(status)}
                className={`min-h-[260px] rounded-xl border p-3 transition-colors ${
                  dragOverStatus === status
                    ? 'border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-200 dark:border-indigo-600 dark:bg-indigo-950/30 dark:ring-indigo-900'
                    : 'border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/40'
                }`}
              >
                <header className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{status}</h4>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {columnItems.length}
                  </span>
                </header>
                <div className="space-y-3">
                  {columnItems.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Drop applications here</p>
                  ) : (
                    columnItems.map((app) => (
                      <article
                        key={app.id}
                        draggable
                        onDragStart={() => setDraggedApplicationId(app.id)}
                        onDragEnd={() => {
                          setDraggedApplicationId(null);
                          setDragOverStatus(null);
                        }}
                        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 ${
                          draggedApplicationId === app.id ? 'opacity-60 ring-2 ring-indigo-300 dark:ring-indigo-700' : ''
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{app.jobTitle}</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{app.companyName}</p>
                        {updatingStatusId === app.id && (
                          <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">Updating…</p>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} statusOptions={STATUS_OPTIONS} />
          ))}
        </ul>
      )}
    </div>
  );
}
