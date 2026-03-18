/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  Info, 
  Settings2, 
  BookOpen, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { generateSimulation, SimulationData } from './services/geminiService';
import SimulationCanvas from './components/SimulationCanvas';

export default function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [controlValues, setControlValues] = useState<Record<string, number>>({});

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateSimulation(topic);
      setSimData(data);
      
      // Initialize control values
      const initialControls: Record<string, number> = {};
      data.controls.forEach(c => {
        initialControls[c.id] = c.defaultValue;
      });
      setControlValues(initialControls);
    } catch (err) {
      console.error(err);
      setError("Failed to generate simulation. Please try again with a different topic.");
    } finally {
      setLoading(false);
    }
  };

  const updateControl = (id: string, value: number) => {
    setControlValues(prev => ({ ...prev, [id]: value }));
  };

  const demoTopics = [
    "Projectile Motion",
    "Newton's Laws",
    "Simple Harmonic Motion",
    "Basic Electric Circuit",
    "Solar System"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-bottom border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-black" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SimuGen <span className="text-emerald-500">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Explore</a>
            <a href="#" className="hover:text-white transition-colors">Library</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Input & Info */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Search size={18} className="text-emerald-500" />
                Generate Simulation
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic (e.g. Wave Interference)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                <button
                  disabled={loading || !topic.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try these</p>
                <div className="flex flex-wrap gap-2">
                  {demoTopics.map(t => (
                    <button
                      key={t}
                      onClick={() => { setTopic(t); }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 border border-white/5 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm"
                >
                  <AlertCircle className="shrink-0" size={18} />
                  <p>{error}</p>
                </motion.div>
              )}

              {simData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Explanation Card */}
                  <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-emerald-500" />
                      Concept Breakdown
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      {simData.explanation}
                    </p>
                    
                    {simData.formulas.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Formulas</p>
                        {simData.formulas.map((f, i) => (
                          <div key={i} className="bg-black/30 p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] text-emerald-500 font-mono uppercase mb-1">{f.label}</p>
                            <p className="text-sm font-mono text-white">{f.formula}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Controls Card */}
                  <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Settings2 size={18} className="text-emerald-500" />
                      Simulation Parameters
                    </h3>
                    <div className="space-y-6">
                      {simData.controls.map(control => (
                        <div key={control.id} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <label className="text-slate-400 font-medium">{control.label}</label>
                            <span className="text-emerald-500 font-mono">{controlValues[control.id]?.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            value={controlValues[control.id] || control.defaultValue}
                            onChange={(e) => updateControl(control.id, parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Simulation View */}
          <div className="lg:col-span-8">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <AnimatePresence mode="wait">
                {!simData && !loading ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border-2 border-dashed border-white/5 rounded-3xl"
                  >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="text-slate-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to Visualize?</h2>
                    <p className="text-slate-500 max-w-md">
                      Enter a scientific concept or physics problem on the left to generate a real-time interactive simulation.
                    </p>
                  </motion.div>
                ) : loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-white/10 rounded-3xl"
                  >
                    <div className="relative">
                      <Loader2 className="animate-spin text-emerald-500" size={64} />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400/50" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-2">Architecting Simulation...</h2>
                    <p className="text-slate-500 max-w-md animate-pulse">
                      Gemini is calculating physics parameters and generating rendering logic.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="simulation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{simData?.name}</h1>
                        <p className="text-sm text-slate-500">{simData?.description}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Engine</span>
                      </div>
                    </div>
                    
                    <div className="h-[calc(100%-4rem)]">
                      {simData && (
                        <SimulationCanvas 
                          data={simData} 
                          controls={controlValues} 
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Powered by Gemini 3.1 Pro</span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 SimuGen AI. Interactive Learning Reimagined.</p>
        </div>
      </footer>
    </div>
  );
}
