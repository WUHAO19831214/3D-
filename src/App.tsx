import React, { useState, useEffect } from 'react';
import { Settings2, Layers, MoveRight, Eye } from 'lucide-react';
import PolarizationScene from './components/PolarizationScene';

type Mode = 'middle' | 'last';

export default function App() {
  const [mode, setMode] = useState<Mode>('middle');
  const [angleP1, setAngleP1] = useState(0);
  const [angleP2, setAngleP2] = useState(45);
  const [angleP3, setAngleP3] = useState(90);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'middle') {
      // Crossed are P1 and P3. P2 is inserted in middle.
      setAngleP1(0);
      setAngleP2(45);
      setAngleP3(90);
    } else {
      // Crossed are P1 and P2. P3 is at the end.
      setAngleP1(0);
      setAngleP2(90);
      setAngleP3(45);
    }
  };

  // Calculation (Amplitude and Intensity) strictly Left to Right: P1 -> P2 -> P3
  const amp1 = 1.0; 
  const I_1 = 100; // 100%

  const diff12 = angleP2 - angleP1;
  const amp2 = amp1 * Math.cos(diff12 * Math.PI / 180);
  const I_2 = I_1 * Math.pow(Math.cos(diff12 * Math.PI / 180), 2);

  const diff23 = angleP3 - angleP2;
  const amp3 = amp2 * Math.cos(diff23 * Math.PI / 180);
  const I_3 = I_2 * Math.pow(Math.cos(diff23 * Math.PI / 180), 2);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Stats Panel */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-8 md:space-x-12">
           <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">P1 后光强</span>
              <span className="text-2xl font-mono text-blue-600">100%</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">P2 透射率</span>
              <span className="text-2xl font-mono text-amber-600">{I_2.toFixed(1)}%</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">最终透射率 (P3)</span>
              <span className="text-2xl font-mono text-red-600 font-bold">{I_3.toFixed(1)}%</span>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <label className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm flex items-center transition-colors ${mode === 'middle' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
             <input type="radio" className="sr-only" checked={mode === 'middle'} onChange={() => handleModeChange('middle')} />
             <Layers className="w-4 h-4 mr-2" />
             中间插入 (P1⊥P3, 调P2)
          </label>
          <label className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm flex items-center transition-colors ${mode === 'last' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
             <input type="radio" className="sr-only" checked={mode === 'last'} onChange={() => handleModeChange('last')} />
             <MoveRight className="w-4 h-4 mr-2" />
             末尾追加 (P1⊥P2, 调P3)
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden relative">
        
        {/* Explanation Panel */}
        <aside className="w-full xl:w-1/3 max-w-lg bg-white border-r border-slate-200 flex flex-col z-10 shadow-lg shrink-0 h-full overflow-y-auto">
          <div className="p-6">
            <h1 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-indigo-600" />
              三偏振片实验: 光强衰减与投影
            </h1>
            <div className="inline-flex mb-6 text-sm font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              物理顺序: <span className="text-indigo-600 ml-1">P1 → P2 → P3</span>
            </div>

            <div className="space-y-6 text-slate-700 text-sm md:text-base leading-relaxed">
              
              <div className="relative pl-6 border-l-2 border-blue-200">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5" />
                <h3 className="font-semibold text-slate-900 mb-1">1. 经过 P1:</h3>
                <p>自然光变成线偏振光，光强 <span className="font-mono bg-slate-100 px-1 rounded">I<sub className="text-[10px]">1</sub> = 100%</span>，方向 <span className="font-mono font-medium">{angleP1}°</span>。</p>
              </div>

              <div className="relative pl-6 border-l-2 border-amber-200">
                <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px] top-1.5" />
                <h3 className="font-semibold text-slate-900 mb-1">2. 经过中间的 P2:</h3>
                <p className="mb-2">此阶段偏振方向向 <span className="font-mono">{angleP2}°</span> 投影，与P1夹角为 <span className="font-mono">|{angleP2}° - {angleP1}°| = {Math.abs(angleP2 - angleP1)}°</span>。</p>
                <div className="bg-slate-50 p-3 rounded-md font-mono text-xs text-slate-800 break-words">
                  I<sub className="text-[10px]">2</sub> = I<sub className="text-[10px]">1</sub> · cos²({Math.abs(angleP2 - angleP1)}°)<br/>
                  I<sub className="text-[10px]">2</sub> = {I_2.toFixed(1)}%
                </div>
              </div>

              <div className="relative pl-6 border-l-2 border-red-200">
                <div className="absolute w-3 h-3 bg-red-400 rounded-full -left-[7px] top-1.5" />
                <h3 className="font-semibold text-slate-900 mb-1">3. 经过最后的 P3:</h3>
                <p className="mb-2">最终偏振向 <span className="font-mono">{angleP3}°</span> 投影，与P2夹角为 <span className="font-mono">|{angleP3}° - {angleP2}°| = {Math.abs(angleP3 - angleP2)}°</span>。</p>
                <div className="bg-slate-50 p-3 rounded-md font-mono text-xs text-slate-800 break-words">
                  I<sub className="text-[10px]">3</sub> = I<sub className="text-[10px]">2</sub> · cos²({Math.abs(angleP3 - angleP2)}°)<br/>
                  I<sub className="text-[10px]">3</sub> = {I_3.toFixed(1)}%
                </div>
              </div>

              {I_3 > 0.01 ? (
                <div className="mt-8 p-4 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-lg shadow-sm">
                  <strong>悖论解除：</strong><br/>只要相邻两个偏振片之间<strong>不完全垂直 (90°)</strong>，光强就不会降为0，光波总是能产生“投影分量”。<br/><br/>
                  这也是为什么头尾两个偏振片 (P1和P3) 即使垂直，只要中间插个斜置的 P2，光最终依然能透过去！
                </div>
              ) : (
                <div className="mt-8 p-4 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg shadow-sm">
                  <strong>光路被阻断：</strong><br/>因为出现了严格相差 90° 的相邻偏振片组合，在该节点光强完全归零 (<span className="font-mono">cos 90° = 0</span>)，透射终结。后方的偏振片无论如何扭转也无法“无中生有”变出光来。
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 3D Visualization Canvas Container */}
        <section className="flex-1 relative bg-slate-50 min-h-[50vh]">
          {/* Controls overlaid */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 z-20 border border-slate-200/50 transition-all">
            <div className="flex items-center mb-4">
              <Settings2 className="w-5 h-5 text-slate-700 mr-2" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-800">调节偏振方向 (角度)</h2>
            </div>
            
            <div className="space-y-5">
              {/* Slider 1 */}
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">P1</span>
                <input 
                  type="range" min="0" max="180" value={angleP1} onChange={(e) => setAngleP1(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-right font-mono text-sm text-slate-600">{angleP1}°</span>
              </div>
              
              {/* Slider 2 */}
              <div className={`flex items-center gap-4 transition-colors ${mode === 'middle' ? 'opacity-100' : 'opacity-70'}`}>
                <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 ${mode === 'middle' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' : 'bg-slate-200 text-slate-700'}`}>P2</span>
                <input 
                  type="range" min="0" max="180" value={angleP2} onChange={(e) => setAngleP2(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-right font-mono text-sm text-slate-600">{angleP2}°</span>
              </div>

              {/* Slider 3 */}
              <div className={`flex items-center gap-4 transition-colors ${mode === 'last' ? 'opacity-100' : 'opacity-70'}`}>
                <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 ${mode === 'last' ? 'bg-red-100 text-red-700 ring-2 ring-red-400' : 'bg-slate-200 text-slate-700'}`}>P3</span>
                <input 
                  type="range" min="0" max="180" value={angleP3} onChange={(e) => setAngleP3(parseInt(e.target.value))}
                  className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-right font-mono text-sm text-slate-600">{angleP3}°</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-full absolute inset-0">
             <PolarizationScene 
                angleL={angleP1} angleM={angleP2} angleR={angleP3}
                nameL="P1" nameM="P2" nameR="P3"
                ampL={amp1} ampM={amp2} ampR={amp3} 
             />
          </div>
        </section>
        
      </main>
    </div>
  );
}
