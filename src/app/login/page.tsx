'use client';

import { useState } from 'react';
import { login, signup } from './actions'
import { FaUserCircle, FaEnvelope, FaLock } from 'react-icons/fa';

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-2 inline-block text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    // On success, redirect will happen server-side
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
            <FaEnvelope />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-pink-300 bg-white/80 transition"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">
            <FaLock />
          </span>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-purple-300 bg-white/80 transition"
            placeholder="••••••••"
          />
        </div>
      </div>
      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 rounded-lg shadow-lg transition flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading && <Spinner />}
        Log in
      </button>
    </form>
  );
}

function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const form = e.currentTarget as HTMLFormElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    if (!emailInput?.value || !passwordInput?.value) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const email = emailInput.value;
    const formData = new FormData(form);
    
    try {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        setUserEmail(email);
        // Clear the form
        form.reset();
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
            <FaEnvelope />
          </span>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-pink-300 bg-white/80 transition"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">
            <FaLock />
          </span>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-purple-300 bg-white/80 transition"
            placeholder="••••••••"
          />
        </div>
      </div>
      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Please check your email at <span className="font-semibold">{userEmail}</span> and click the confirmation link to activate your account.</span>
        </div>
      ) : (
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2 rounded-lg shadow-lg transition flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading && <Spinner />}
          Sign up
        </button>
      )}
    </form>
  );
}

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e0c3fc] via-[#8ec5fc] to-[#f093fb]">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-2xl p-8 border border-white/40">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg">
            <FaUserCircle className="h-10 w-10 text-white" />
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-500 mb-2 tracking-wide">
          {showSignup ? 'Sign up for ClaudeSpark' : 'Sign in to ClaudeSpark'}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {showSignup ? 'Create your account to get started' : 'Enter your credentials to continue'}
        </p>
        {showSignup ? <SignupForm /> : <LoginForm />}
        <div className="mt-6 text-center">
          {showSignup ? (
            <span className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                className="text-purple-600 font-semibold hover:underline"
                onClick={() => setShowSignup(false)}
              >
                Log in
              </button>
            </span>
          ) : (
            <span className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-pink-600 font-semibold hover:underline"
                onClick={() => setShowSignup(true)}
              >
                Sign up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}