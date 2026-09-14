'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Eye, EyeOff } from 'lucide-react'

import { api } from '../../lib/api'

export default function LoginPage() {
	const [isSetup, setIsSetup] = useState(false)
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setMessage('')
		setSubmitting(true)
		const form = new FormData(event.currentTarget)

		try {
			const email = String(form.get('email') ?? '')
			const password = String(form.get('password') ?? '')
			if (isSetup) {
				const confirmPassword = String(form.get('confirmPassword') ?? '')
				if (password !== confirmPassword) {
					throw new Error('Passwords do not match.')
				}
				await api.setupAdmin({ name: String(form.get('name') ?? ''), email, password })
				setIsSetup(false)
				setShowPassword(false)
				setShowConfirmPassword(false)
				setMessage('Admin account created. Sign in to continue.')
			} else {
				const session = await api.login(email, password)
				api.saveSession(session)
				window.location.assign(`/${session.role}`)
			}
		} catch (submissionError) {
			setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] p-4 font-sans sm:p-5">
			<div className="w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,.12)] sm:p-8">
				<div className="mb-8 text-center">
					  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0052CC] text-white shadow-sm"><BookOpen size={42} strokeWidth={2.5} /></div>
					<h1 className="mt-6 text-3xl font-bold tracking-tight text-[#0F172A]">EduInsight AI</h1>
					<p className="mt-3 text-lg text-[#64748B]">AI-Powered Learning Platform</p>
				</div>
				<div className="mb-7">
					<h2 className="text-2xl font-bold text-[#0F172A]">{isSetup ? 'Initial Admin Setup' : 'Welcome back'}</h2>
					<p className="mt-3 text-lg text-[#475569]">{isSetup ? 'Initialize the primary system administrator account' : 'Sign in to your account'}</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-5">
					{isSetup && <label className="block text-sm font-semibold text-[#0F172A]">
						Full Name
						<input name="name" type="text" required className="mt-2 w-full rounded-xl border border-[#DBEAFE] bg-white px-4 py-3.5 text-base outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DBEAFE]" />
					</label>}
					<label className="block text-sm font-semibold text-[#0F172A]">
						{isSetup ? 'Email Address' : 'Email'}
						<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-[#DBEAFE] bg-white px-4 py-3.5 text-base outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DBEAFE]" />
					</label>
					<label className="block text-sm font-semibold text-[#0F172A]">
						Password
						<div className="relative mt-2"><input name="password" type={showPassword ? 'text' : 'password'} required className="w-full rounded-xl border border-[#DBEAFE] bg-white px-4 py-3.5 pr-12 text-base outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DBEAFE]" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
					</label>
					{isSetup && <label className="block text-sm font-semibold text-[#0F172A]">
						Confirm Password
						<div className="relative mt-2"><input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required className="w-full rounded-xl border border-[#DBEAFE] bg-white px-4 py-3.5 pr-12 text-base outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DBEAFE]" /><button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
					</label>}
					{!isSetup && <div className="flex items-center justify-between text-sm">
						<label className="flex items-center gap-2 text-[#475569]"><input name="rememberMe" type="checkbox" className="h-4 w-4 accent-[#0052CC]" />Remember me</label>
						<span className="font-semibold text-[#0052CC]">Forgot password?</span>
					</div>}
					{error && <p className="text-sm font-semibold text-red-600">{error}</p>}
					{message && <p className="text-sm font-semibold text-green-700">{message}</p>}
					<button disabled={submitting} className="w-full rounded-xl bg-[#0052CC] px-4 py-3.5 text-base font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
						{submitting ? (isSetup ? 'Registering...' : 'Signing in...') : (isSetup ? 'Register Admin' : 'Sign In')}
					</button>
				</form>
				<div className="my-7 border-t border-[#DBEAFE]" />
				{isSetup ? <button type="button" onClick={() => { setIsSetup(false); setError(''); setMessage(''); setShowPassword(false); setShowConfirmPassword(false) }} className="block w-full text-center text-sm font-semibold text-[#0052CC] hover:underline">
					Back to Sign In
				</button> : <Link href="/setup" className="block w-full text-center text-sm font-semibold text-[#0052CC] hover:underline">
					Create the First Admin Account
				</Link>}
				<p className="mt-3 text-center text-xs leading-5 text-[#64748B]">
					This creates the first administrator only. Students and teachers must be added by the administrator.
				</p>
			</div>
		</main>
	)
}
