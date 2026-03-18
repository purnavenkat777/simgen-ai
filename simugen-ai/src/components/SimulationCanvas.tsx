import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SimulationData } from '../services/geminiService';

interface SimulationCanvasProps {
  data: SimulationData;
  controls: Record<string, number>;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ data, controls }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const stateRef = useRef<any>({});
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(null);

  // Compile logic functions
  const logicRef = useRef<{
    init: Function;
    update: Function;
    draw: Function;
  } | null>(null);

  useEffect(() => {
    try {
      logicRef.current = {
        init: new Function('state', data.logic.init),
        update: new Function('state', 'dt', 'controls', data.logic.update),
        draw: new Function('ctx', 'state', 'width', 'height', 'controls', data.logic.draw),
      };
      handleReset();
    } catch (err) {
      console.error("Error compiling simulation logic:", err);
    }
  }, [data]);

  const handleReset = () => {
    stateRef.current = {};
    if (logicRef.current) {
      logicRef.current.init(stateRef.current);
    }
    lastTimeRef.current = performance.now();
  };

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const animate = (time: number) => {
    if (!canvasRef.current || !logicRef.current) return;

    const dt = (time - (lastTimeRef.current || time)) / 1000;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isPlaying) {
      const clampedDt = Math.min(dt, 0.1);
      try {
        logicRef.current.update(stateRef.current, clampedDt, controls);
      } catch (e) {
        console.error("Update error:", e);
      }
    }

    // Clear and Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    try {
      logicRef.current.draw(ctx, stateRef.current, canvas.width, canvas.height, controls);
    } catch (e) {
      console.error("Draw error:", e);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, controls]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <div className="flex-1 relative min-h-[400px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="p-4 bg-slate-800/50 backdrop-blur-md border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-colors shadow-lg shadow-emerald-500/20"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        
        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          {isPlaying ? 'Simulation Running' : 'Simulation Paused'}
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;
