"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CarpetFlowApp() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // --- States ---
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [rollWidth, setRollWidth] = useState<number>(4);
  const [pricePerSqm, setPricePerSqm] = useState<number>(0);
  
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState(''); // NEW: Email State
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- Auth Gate ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  // --- Logic ---
  const totalSqmNeeded = length * rollWidth;
  const totalPrice = totalSqmNeeded * pricePerSqm;
  const actualRoomSqm = length * width;
  const wasteSqm = totalSqmNeeded > actualRoomSqm ? totalSqmNeeded - actualRoomSqm : 0;

  const handleSaveQuote = async () => {
    if (!customerName || !phone || !email || length <= 0 || pricePerSqm <= 0) {
      alert("Please fill in all fields, including the customer email.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('quotes').insert([{ 
      customer_name: customerName,
      customer_email: email, // Ensure this column exists in Supabase
      phone, 
      address, 
      total_price: totalPrice, 
      sqm: totalSqmNeeded,
      status: 'pending'
    }]);

    if (!error) {
      setSuccess(true);
      // Trigger HubSpot API
      fetch('/api/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName, email, phone, address })
      }).catch(e => console.error("HubSpot sync failed:", e));
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6">
        <p className="text-blue-400 font-black animate-pulse tracking-widest text-[10px] uppercase">Securing FloorFlow Environment...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="bg-blue-600 text-white p-8 rounded-b-[3rem] shadow-lg mb-8">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">FloorFlow</h1>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="text-[10px] font-black bg-blue-700 px-4 py-2 rounded-xl uppercase transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        
        {/* Section 1: Measurements */}
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">1. Job Dimensions</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Length (m)</label>
              <input type="number" step="0.01" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setLength(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Width (m)</label>
              <input type="number" step="0.01" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setWidth(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2">
            {[4, 5].map(w => (
              <button 
                key={w} 
                onClick={() => setRollWidth(w)} 
                className={`flex-1 py-4 rounded-2xl font-black transition-all ${rollWidth === w ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400'}`}
              >
                {w}M Roll
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Unit Price */}
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">2. Set Price per m²</h2>
          <input 
            type="number" 
            placeholder="£ 0.00" 
            className="w-full p-4 bg-blue-50 rounded-2xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-bold" 
            onChange={e => setPricePerSqm(Number(e.target.value))} 
          />
        </section>

        {/* Section 3: Customer Details (Updated with Email) */}
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Customer Info</h2>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Full Name</label>
            <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100" onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Address</label>
            <input type="email" placeholder="john@example.com" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100" onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Phone Number</label>
            <input type="tel" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100" onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Property Address</label>
            <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100" onChange={e => setAddress(e.target.value)} />
          </div>
        </section>

        {/* Section 4: Result */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl overflow-hidden">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Quote</p>
              <h3 className="text-5xl font-black text-green-400">£{totalPrice.toFixed(2)}</h3>
              <p className="text-[10px] text-orange-400 font-bold mt-2">{wasteSqm > 0 ? `Incl. ${wasteSqm.toFixed(2)}m² Waste` : 'Exact Fit'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-40 uppercase font-bold">Material</p>
              <p className="font-bold text-sm text-slate-300">{totalSqmNeeded.toFixed(1)} m²</p>
            </div>
          </div>
          
          <button 
            onClick={handleSaveQuote}
            disabled={loading}
            className={`w-full py-6 rounded-2xl font-black text-xl transition-all active:scale-95 ${success ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-500 shadow-xl'}`}
          >
            {loading ? 'SYNCING...' : success ? '✓ LEAD CAPTURED' : 'SAVE & FINALIZE'}
          </button>
        </div>
      </div>
    </main>
  );
}