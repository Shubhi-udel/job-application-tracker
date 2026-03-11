'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const email = inputEl.value.trim().toLowerCase();
    if (!email) return;

    setSending(true);
    try {
      await db.auth.sendMagicCode({ email });
      onSendEmail(email);
    } catch (err: unknown) {
      const message =
        (err as { body?: { message?: string } })?.body?.message ??
        'Failed to send code. Please try again.';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
      <p className="text-slate-600 dark:text-slate-400">
        Enter your email and we&apos;ll send you a 6-digit verification code. We&apos;ll create an
        account for you if you don&apos;t have one.
      </p>
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="email"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
        placeholder="you@example.com"
        required
        autoFocus
        disabled={sending}
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {sending ? 'Sending code…' : 'Send code'}
      </button>
    </form>
  );
}

function CodeStep({
  sentEmail,
  onBack,
}: {
  sentEmail: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const code = inputEl.value.replace(/\D/g, '').slice(0, 6);
    if (code.length !== 6) {
      setError('Please enter all 6 digits from the email.');
      return;
    }

    setVerifying(true);
    try {
      await db.auth.signInWithMagicCode({
        email: sentEmail.trim().toLowerCase(),
        code,
      });
      router.replace('/');
    } catch (err: unknown) {
      const message =
        (err as { body?: { message?: string } })?.body?.message ??
        'Invalid or expired code. Please request a new one and try again.';
      if (message.toLowerCase().includes('record not found')) {
        setError('This code is invalid or already used. Request a new code and try again.');
      } else {
        setError(message);
      }
      inputEl.value = '';
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Enter your code</h2>
      <p className="text-slate-600 dark:text-slate-400">
        We sent a 6-digit code to{' '}
        <strong className="text-slate-900 dark:text-slate-100">{sentEmail}</strong>. Check your
        inbox and enter it below.
      </p>
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={6}
        pattern="[0-9]{6}"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
        placeholder="000000"
        required
        autoFocus
        disabled={verifying}
      />
      <button
        type="submit"
        disabled={verifying}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {verifying ? 'Verifying…' : 'Verify code'}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        ← Use a different email
      </button>
    </form>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [sentEmail, setSentEmail] = useState('');
  const { user } = db.useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex w-full max-w-sm items-center justify-between">
        <Link
          href="/"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          ← Back
        </Link>
      </div>
      {!sentEmail ? (
        <EmailStep onSendEmail={setSentEmail} />
      ) : (
        <CodeStep sentEmail={sentEmail} onBack={() => setSentEmail('')} />
      )}
    </div>
  );
}
