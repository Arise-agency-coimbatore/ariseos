'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    setErrorMsg('Check your email for a confirmation link.');
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 className="text-4xl font-bold text-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          AriseOS
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm glass-card p-8">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-navy-200">
              Email address
            </label>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-navy-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 bg-navy-900/50 py-2.5 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-navy-200">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-navy-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 bg-navy-900/50 py-2.5 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl bg-cyan-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Processing...' : 'Sign in'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 text-center text-sm font-medium text-orange-400">
            {errorMsg}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-navy-300">
          Not a member?{' '}
          <button onClick={handleSignUp} type="button" className="font-semibold leading-6 text-cyan-400 hover:text-cyan-300 bg-transparent border-none p-0 cursor-pointer">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
