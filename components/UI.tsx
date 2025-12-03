import React from 'react';
import { TreeMorphState } from '../types';

interface UIProps {
  state: TreeMorphState;
  onToggle: () => void;
}

export const UI: React.FC<UIProps> = ({ state, onToggle }) => {
  const isTree = state === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center justify-center text-center space-y-2 opacity-90">
        <h3 className="text-amber-500/80 tracking-[0.5em] text-xs font-bold uppercase title-font">
          to my best friends
        </h3>
        <h1 className="text-4xl md:text-6xl text-white font-light tracking-wide lux-font">
          Merry <span className="italic text-emerald-400">Christmas</span>
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center pointer-events-auto pb-8">
        <button
          onClick={onToggle}
          className={`
            group relative px-8 py-4 bg-transparent overflow-hidden rounded-sm transition-all duration-500
            border border-white/20 hover:border-white/60
          `}
        >
          {/* Background fill animation */}
          <span 
            className={`absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-800 transition-transform duration-700 ease-out origin-left ${isTree ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 opacity-50'}`} 
          />
          
          <span className="relative flex items-center space-x-3">
             <span className={`h-1.5 w-1.5 rounded-full shadow-[0_0_10px_white] transition-colors duration-300 ${isTree ? 'bg-red-500 shadow-red-500' : 'bg-white'}`}></span>
             <span className="text-white tracking-widest uppercase text-sm title-font font-bold">
               {isTree ? 'Scatter Elements' : 'Assemble Tree'}
             </span>
          </span>
        </button>

        <p className="mt-4 text-white/30 text-xs tracking-wider font-light">
          Interactive 3D WebGL Experience
        </p>
      </div>
    </div>
  );
};