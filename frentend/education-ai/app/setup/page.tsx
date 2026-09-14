'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { api } from '../../lib/api'

export default function SetupPage() {
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    const formElement = event.currentTarget
    const form = new FormData(formElement)

    try {
      await api.setupAdmin({
        name: String(form.get('full_name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      })
      setMessage('Admin environment created. You can sign in now.')
      formElement.reset()
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to create the admin environment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] p-4 font-sans sm:p-5">
      <div className="w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,.12)] sm:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0052CC]">EduInsight AI</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0F172A]">Create the first admin account</h1>
          <p className="mt-2 text-sm leading-6 text-[#475569]">Only the first administrator can be created here. That administrator adds classes, students, and teachers from the workspace.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-[#0F172A]">
            Full name
            <input name="full_name" required className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#0052CC]" />
          </label>
          <label className="block text-sm font-semibold text-[#0F172A]">
            Email
            <input name="email" type="email" required className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#0052CC]" />
          </label>
          <label className="block text-sm font-semibold text-[#0F172A]">
            Password
            <input name="password" type="password" required minLength={8} className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#0052CC]" />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-[#0052CC]">{message}</p>}
          <button disabled={submitting} className="w-full rounded-lg bg-[#0052CC] px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Creating...' : 'Create admin environment'}
          </button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-[#0052CC] hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
