"use client";
import React, { useState } from 'react';

export default function CarpetEstimator() {
  // State for inputs
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [rollWidth, setRollWidth] = useState<4 | 5>(4); // Default to 4m roll
  const [pricePerSqm, setPricePerSqm] = useState<number>(25); // Average price

  // Calculation Logic
  // Carpet is sold by the "Linear Meter" of a fixed-width roll
  // If room is 3.5m wide, and roll is 4m, you still buy the 4m width.
  const totalSqmNeeded = length * rollWidth;
  const actualRoomSqm = length * width;
  const wasteSqm = totalSqmNeeded - actualRoomSqm;
  const totalPrice = totalSqmNeeded * pricePerSqm;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-2xl rounded-2xl mt-10 border border-gray-100">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">FloorFlow Pro</h1>
        <p className="text-slate-500 text-sm">Professional Quote Generator</p>
      </header>

      {/* Input Section */}
      <section className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Room Dimensions (m)</label>
          <div className="flex gap-2">
            <input 
              type="number" placeholder="Length" 
              className="w-1/2 p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setLength(Number(e.target.value))}
            />
            <input 
              type="number" placeholder="Width" 
              className="w-1/2 p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Roll Width</label>
          <div className="flex gap-2">
            {[4, 5].map((w) => (
              <button 
                key={w}
                onClick={() => setRollWidth(w as 4 | 5)}
                className={`flex-1 py-2 rounded-lg font-bold transition ${rollWidth === w ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {w}m Roll
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Price per m² (£)</label>
          <input 
            type="number" value={pricePerSqm}
            className="w-full p-3 bg-slate-50 border rounded-lg"
            onChange={(e) => setPricePerSqm(Number(e.target.value))}
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="mt-8 p-4 bg-slate-900 rounded-xl text-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400">Total Order:</span>
          <span className="text-xl font-bold">{totalSqmNeeded.toFixed(2)} m²</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-400">Waste:</span>
          <span className={`text-sm ${wasteSqm < 0 ? 'text-red-400' : 'text-orange-300'}`}>
            {wasteSqm < 0 ? "Width exceeds roll!" : `${wasteSqm.toFixed(2)} m²`}
          </span>
        </div>
        <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold">Estimated Total:</span>
          <span className="text-2xl font-extrabold text-green-400">£{totalPrice.toFixed(2)}</span>
        </div>
      </section>

      {/* Lead Capture */}
      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg">
        Create Official PDF Quote
      </button>
    </div>
  );
}