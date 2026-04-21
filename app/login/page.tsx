"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Invalid login details.");
    } else {
      router.push('/'); // Now send them to the Estimator (Home)
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter">FLOORFLOW</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Authorized Staff Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <input 
              type="email" 
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="name@carpetshop.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={authLoading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {authLoading ? "VERIFYING..." : "ENTER PORTAL"}
          </button>
        </form>
      </div>
    </div>
  );
}