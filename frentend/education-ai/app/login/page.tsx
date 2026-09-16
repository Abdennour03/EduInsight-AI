'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

import { api } from '../../lib/api'
import { LANGUAGE_KEY, languages, type Language, translate } from '../../lib/i18n'

function LandingLogo() {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path d="M10 3L2 7.5l8 4.5 8-4.5L10 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
			<path d="M5 9.5V14c0 1.657 2.239 3 5 3s5-1.343 5-3V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			<path d="M17.5 7.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
		</svg>
	)
}

export default function LoginPage() {
	const [isSetup, setIsSetup] = useState(false)
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [language, setLanguage] = useState<Language>('en')

	useEffect(() => {
		const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY) as Language | null
		if (storedLanguage === 'en' || storedLanguage === 'fr' || storedLanguage === 'ar') {
			setLanguage(storedLanguage)
			document.documentElement.lang = storedLanguage
			document.documentElement.dir = storedLanguage === 'ar' ? 'rtl' : 'ltr'
		}
	}, [])

	function changeLanguage(value: Language) {
		setLanguage(value)
		window.localStorage.setItem(LANGUAGE_KEY, value)
		document.documentElement.lang = value
		document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr'
		window.dispatchEvent(new CustomEvent('eduinsight-language-change', { detail: value }))
	}

	const text = (key: string) => translate(language, key)

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
		<main dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen items-center justify-center bg-[#F5F8F2] p-4 font-sans sm:p-5">
			<div className="w-full max-w-md rounded-2xl border border-[#E7D39A] border-t-4 border-t-[#D4A72C] bg-white p-6 shadow-[0_12px_35px_rgba(42,92,55,.12)] sm:p-8">
				<div className="mb-5 flex items-center justify-end gap-2">
					<label htmlFor="language" className="text-xs font-semibold text-[#64748B]">{text('language')}</label>
					<select id="language" value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="rounded-lg border border-[#DDE8D6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#334155] outline-none focus:border-[#D4A72C]">
						{languages.map((item) => <option key={item.value} value={item.value}>{item.nativeLabel}</option>)}
					</select>
				</div>
				<div className="mb-8 text-center">
					<div className="flex items-center justify-center gap-3">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1769E0] text-white shadow-[0_5px_12px_rgba(23,105,224,.22)]"><LandingLogo /></div>
						<h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">EduInsight AI</h1>
					</div>
					<p className="mt-3 text-lg text-[#64748B]">AI-Powered Learning Platform</p>
				</div>
				<div className="mb-7">
					<h2 className="text-2xl font-bold text-[#0F172A]">{isSetup ? 'Initial Admin Setup' : text('welcomeBack')}</h2>
					<p className="mt-3 text-lg text-[#475569]">{isSetup ? 'Initialize the primary system administrator account' : text('signInAccount')}</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-5">
					{isSetup && <label className="block text-sm font-semibold text-[#0F172A]">
						Full Name
						<input name="name" type="text" required className="mt-2 w-full rounded-xl border border-[#DDE8D6] bg-white px-4 py-3.5 text-base outline-none focus:border-[#D4A72C] focus:ring-2 focus:ring-[#F4E6B9]" />
					</label>}
					<label className="block text-sm font-semibold text-[#0F172A]">
						{isSetup ? 'Email Address' : text('email')}
						<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-[#DDE8D6] bg-white px-4 py-3.5 text-base outline-none focus:border-[#D4A72C] focus:ring-2 focus:ring-[#F4E6B9]" />
					</label>
					<label className="block text-sm font-semibold text-[#0F172A]">
						{text('password')}
						<div className="relative mt-2"><input name="password" type={showPassword ? 'text' : 'password'} required className="w-full rounded-xl border border-[#DDE8D6] bg-white px-4 py-3.5 pr-12 text-base outline-none focus:border-[#D4A72C] focus:ring-2 focus:ring-[#F4E6B9]" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D7A62]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
					</label>
					{isSetup && <label className="block text-sm font-semibold text-[#0F172A]">
						Confirm Password
						<div className="relative mt-2"><input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required className="w-full rounded-xl border border-[#DDE8D6] bg-white px-4 py-3.5 pr-12 text-base outline-none focus:border-[#D4A72C] focus:ring-2 focus:ring-[#F4E6B9]" /><button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D7A62]">{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
					</label>}
					{!isSetup && <div className="flex items-center justify-between text-sm">
						<label className="flex items-center gap-2 text-[#475569]"><input name="rememberMe" type="checkbox" className="h-4 w-4 accent-[#1769E0]" />Remember me</label>
						<span className="font-semibold text-[#A87912]">Forgot password?</span>
					</div>}
					{error && <p className="text-sm font-semibold text-red-600">{error}</p>}
					{message && <p className="text-sm font-semibold text-green-700">{message}</p>}
					<button disabled={submitting} className="w-full rounded-xl bg-[#1769E0] px-4 py-3.5 text-base font-bold text-white shadow-[0_5px_12px_rgba(23,105,224,.2)] hover:bg-[#1257BD] disabled:cursor-not-allowed disabled:opacity-60">
						{submitting ? (isSetup ? 'Registering...' : 'Signing in...') : (isSetup ? 'Register Admin' : text('signIn'))}
					</button>
				</form>
				<div className="my-7 border-t border-[#E7D39A]" />
				{isSetup ? <button type="button" onClick={() => { setIsSetup(false); setError(''); setMessage(''); setShowPassword(false); setShowConfirmPassword(false) }} className="block w-full text-center text-sm font-semibold text-[#A87912] hover:underline">
					Back to Sign In
				</button> : <Link href="/setup" className="block w-full text-center text-sm font-semibold text-[#A87912] hover:underline">
					Create the First Admin Account
				</Link>}
				<p className="mt-3 text-center text-xs leading-5 text-[#64748B]">
					This creates the first administrator only. Students and teachers must be added by the administrator.
				</p>
			</div>
		</main>
	)
}
