"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface Quote {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  total_price: number;
  sqm: number;
  status: string;
  address?: string;
}

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setQuotes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (!activeUser) {
        router.push('/login');
      } else {
        setUser(activeUser);
        fetchQuotes();
      }
    };
    checkAuth();
  }, [fetchQuotes, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 font-bold animate-pulse tracking-widest uppercase text-sm">
          Establishing Secure Session...
        </div>
      </div>
    );
  }

  // Business Intelligence: Calculate total pipeline and average job value
  const totalPipeline = quotes.reduce((sum, q) => sum + (Number(q.total_price) || 0), 0);
  const averageJobValue = quotes.length > 0 ? totalPipeline / quotes.length : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tighter italic leading-none">FLOORFLOW</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* KPI Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 rounded-4xl p-8 text-white shadow-2xl md:col-span-2">
            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Pipeline Value</p>
            <h2 className="text-5xl md:text-6xl font-black text-green-400">£{totalPipeline.toLocaleString()}</h2>
            <div className="mt-6 pt-6 border-t border-slate-800 flex gap-8">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Inquiries</p>
                <p className="text-xl font-black">{quotes.length}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Avg. Quote</p>
                <p className="text-xl font-black text-blue-400">£{averageJobValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-4xl p-8 border border-slate-200 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-black text-xl mb-1">Growth Mode</h3>
            <p className="text-slate-400 text-xs font-medium">Keep sending quotes to increase your conversion rate.</p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Live Leads Feed</h2>
          <button 
            onClick={fetchQuotes}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {loading ? "SYNCING..." : "REFRESH FEED"}
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Site Address</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Est. Revenue</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Direct Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                        {quote.customer_name}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">{quote.address}</div>
                      <div className="inline-block mt-2 px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-400 uppercase">
                        {new Date(quote.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-green-600 text-2xl tracking-tighter">
                        £{Number(quote.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{quote.sqm.toFixed(1)} m² Area</p>
                    </td>
                    <td className="p-6">
                      <a 
                        href={`tel:${quote.phone}`}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest hover:bg-blue-600 transition-all block text-center shadow-md shadow-slate-200"
                      >
                        DIAL CUSTOMER
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {quotes.length === 0 && !loading && (
              <div className="p-24 text-center">
                <p className="text-slate-300 font-black text-4xl mb-2 opacity-50">NO DATA</p>
                <p className="text-slate-400 text-sm font-medium">Wait for inquiries to hit your dashboard.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}