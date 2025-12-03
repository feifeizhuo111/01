import React, { useState, useCallback } from 'react';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { TreeMorphState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleState = useCallback(() => {
    setTreeState((prev) => 
      prev === TreeMorphState.SCATTERED 
        ? TreeMorphState.TREE_SHAPE 
        : TreeMorphState.SCATTERED
    );
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <UI state={treeState} onToggle={toggleState} />
      
      {/* 3D Canvas Container */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>
    </div>
  );
}

export default App;