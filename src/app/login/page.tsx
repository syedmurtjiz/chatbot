'use client';

import { useState } from 'react';
import { login, signup } from './actions'
import { FaUserCircle, FaEnvelope, FaLock } from 'react-icons/fa';

function LoginForm() {
  return (
    <form className="space-y-6">
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
      <button
        formAction={login}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 rounded-lg shadow-lg transition"
      >
        Log in
      </button>
    </form>
  );
}

function SignupForm() {
  return (
    <form className="space-y-6">
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
      <button
        formAction={signup}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2 rounded-lg shadow-lg transition"
      >
        Sign up
      </button>
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