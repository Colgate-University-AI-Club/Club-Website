'use client'

import { useState } from 'react'
import { isValidEmail } from '@/lib/validators'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'footer' | 'home'
  className?: string
}

export default function NewsletterSignup({ variant = 'footer', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setErrorMessage('Please enter your email address')
      setStatus('error')
      return
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const payload = {
      email: email.trim(),
      timestamp: new Date().toISOString(),
      source: 'AI Club Website'
    }

    console.log('🔄 Newsletter signup attempt:', payload)

    try {
      console.log('📡 Making fetch request to webhook...')
      const response = await fetch('https://seabass34.app.n8n.cloud/webhook/859ca13a-afa5-4879-946b-4f4cca54527c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      })

      console.log('📥 Response received:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (response.ok) {
        console.log('✅ Newsletter signup successful!')
        setStatus('success')
        setEmail('')
      } else {
        console.error('❌ Newsletter signup failed with status:', response.status)
        const responseText = await response.text()
        console.error('Response body:', responseText)
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('💥 Newsletter signup error:', error)
      setStatus('error')
      setErrorMessage(`Failed to subscribe. ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  // Styling variants for different contexts
  const isFooter = variant === 'footer'
  const containerClasses = isFooter
    ? "bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    : "bg-gradient-to-br from-red-50 via-white to-red-50/50 border border-red-100 rounded-2xl p-6 shadow-sm"

  if (status === 'success') {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <p className="text-red-800 text-sm font-semibold">Welcome to the community!</p>
            <p className="text-red-700 text-xs mt-1 leading-relaxed">
              You&apos;ll receive the latest updates from Colgate AI Club directly in your inbox.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-red-600 hover:text-red-800 text-xs mt-3 font-medium underline decoration-1 underline-offset-2 hover:decoration-2 transition-all"
            >
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${containerClasses} ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isFooter ? "your@email.com" : "Enter your email address"}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground
              transition-all duration-200 focus:outline-none focus:ring-2 focus:border-red-500
              ${status === 'error' ? 'border-red-300 focus:ring-red-200' : 'border-border focus:ring-red-100'}
              ${status === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:border-red-200'}`}
            disabled={status === 'loading'}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            ${status === 'loading'
              ? 'bg-red-300 text-white cursor-not-allowed'
              : 'bg-red-800 hover:bg-red-900 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
            }`}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              {isFooter ? 'Subscribe' : 'Join the Newsletter'}
            </span>
          )}
        </button>
      </form>

      {status === 'error' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}