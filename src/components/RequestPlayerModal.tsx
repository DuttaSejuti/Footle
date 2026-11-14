'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, UserPlus, Loader2, AlertCircle } from 'lucide-react';

interface RequestPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlayerName?: string;
}

export function RequestPlayerModal({
  isOpen,
  onClose,
  initialPlayerName = '',
}: RequestPlayerModalProps) {
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [club, setClub] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPlayerName(initialPlayerName);
      setClub('');
      setNotes('');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, initialPlayerName]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed || trimmed.length < 2) {
      setErrorMessage('Please enter a valid player name (at least 2 letters).');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/player-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: trimmed,
          club: club.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Request player error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0a2615] border-2 border-emerald-400 rounded-2xl shadow-2xl overflow-hidden z-10 text-white">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between p-4 bg-[#0e331c] border-b border-emerald-500/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-headline font-black text-base uppercase tracking-wider text-white">
                Request a Footballer
              </h2>
              <p className="text-[11px] font-mono text-emerald-200">
                Can&apos;t find a player? Send a scouting report!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {status === 'success' ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="font-headline font-black text-lg text-white uppercase tracking-wide">
                Scouting Report Received!
              </h3>
              <p className="text-xs text-emerald-100 max-w-xs mx-auto leading-relaxed">
                Thanks for suggesting <strong className="text-emerald-300 font-bold">{playerName}</strong>. We review player submissions regularly to expand Footble&apos;s squad roster.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black uppercase tracking-wider rounded-xl border-2 border-emerald-300 transition-all cursor-pointer shadow-md"
              >
                Back to the Pitch
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/60 rounded-xl text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                  Footballer Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Lamine Yamal"
                  className="w-full bg-[#06180d] border-2 border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                  Current Club / League <span className="text-emerald-400/60 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  placeholder="e.g. Barcelona / La Liga"
                  className="w-full bg-[#06180d] border-2 border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                  Notes / Position <span className="text-emerald-400/60 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Winger, Spain national team"
                  className="w-full bg-[#06180d] border-2 border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-200 hover:text-white hover:bg-emerald-900/40 font-headline font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-headline font-black text-xs uppercase tracking-wider rounded-xl border-2 border-emerald-300 transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
