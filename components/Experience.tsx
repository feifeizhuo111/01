import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from '@react-three/postprocessing';
import { TreeMorphState } from '../types';
import { TreeInstanced } from './TreeInstanced';
import { StarTop } from './StarTop';
import { Dog } from './Dog';
import { generateTreeData } from '../utils/math';
import * as THREE from 'three';

interface ExperienceProps {
  treeState: TreeMorphState;
}

// Config adjusted for boxes/ribbons
const TREE_CONFIG = {
  height: 14,
  radius: 4.5,
  boxCount: 650,         // Denser packing
  ornamentCount: 160,    
  redBoxCount: 85,      // Full bottom ring
  decorCount: 45,       
  lightCount: 300,      // Twinkling lights
  ribbonSegmentCount: 600, 
  scatterRadius: 40,    // Adjusted for side scatter bounds
};

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  const particles = useMemo(() => generateTreeData(TREE_CONFIG), []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 2, 24]} fov={40} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={12}
        maxDistance={45}
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5} // Slower, more majestic rotation
      />

      {/* --- Environment & Lighting --- */}
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 30, 90]} />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Atmospheric Dust */}
      <Sparkles 
        count={500} 
        scale={[25, 25, 25]} 
        size={1.5} 
        speed={0.2} 
        opacity={0.3} 
        noise={0.1}
        color="#fff" 
      />

      {/* Key Light (Warm, high intensity) */}
      <spotLight 
        position={[15, 20, 15]} 
        angle={0.25} 
        penumbra={1} 
        intensity={400} 
        color="#fff5d6" 
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />

      {/* Rim Light (Cool Blue-ish/Moonlight) - Creates silhouette */}
      <spotLight 
        position={[-15, 10, -15]} 
        angle={0.5}
        intensity={150} 
        color="#e0f2fe" 
      />
      
      {/* Fill/Bounce Light (Subtle Warmth from bottom) */}
      <pointLight position={[0, -10, 5]} intensity={50} color="#ffab73" distance={20} decay={2} />

      {/* HDRI for reflections (Crucial for metallic look) */}
      <Environment preset="city" environmentIntensity={0.6} />

      {/* --- Objects --- */}
      <group position={[0, 0, 0]}>
        <TreeInstanced data={particles} state={treeState} />
        <StarTop state={treeState} height={TREE_CONFIG.height} />
        <Dog state={treeState} height={TREE_CONFIG.height} radius={TREE_CONFIG.radius} />
      </group>

      {/* Magic Base Sparkles (Golden Glow at bottom) */}
      <Sparkles 
        position={[0, -TREE_CONFIG.height / 2, 0]}
        scale={[12, 3, 12]}
        count={200}
        speed={0.5}
        size={8}
        color="#FCD34D"
        opacity={0.5}
        noise={0.5}
      />

      {/* --- Post Processing --- */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.85} // Only bloom very bright spots
          mipmapBlur 
          intensity={1.2} 
          radius={0.4}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.2} />
      </EffectComposer>

    </Canvas>
  );
};