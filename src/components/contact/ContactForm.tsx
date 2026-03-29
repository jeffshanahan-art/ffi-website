'use client';

import { useState } from 'react';

const messageTypes = ['Question', 'Suggestion', 'Comment', 'Other'] as const;

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Something went wrong.');
      }

      setStatus('sent');
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-gray p-8 text-center">
        <div className="font-serif text-2xl text-blue mb-2">Message Sent</div>
        <p className="text-slate text-sm">
          Thanks for reaching out. We&rsquo;ll get back to you soon.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-blue hover:text-blue/70 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-xs text-slate uppercase tracking-wide mb-1.5">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full border border-gray rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs text-slate uppercase tracking-wide mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full border border-gray rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-xs text-slate uppercase tracking-wide mb-1.5">
          Type
        </label>
        <select
          id="type"
          name="type"
          className="w-full border border-gray rounded-md px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
        >
          {messageTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs text-slate uppercase tracking-wide mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full border border-gray rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors resize-vertical"
          placeholder="What's on your mind?"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-blue text-white font-serif text-base py-3 rounded-md hover:bg-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
