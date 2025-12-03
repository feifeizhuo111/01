import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';

interface StarTopProps {
  state: TreeMorphState;
  height: number;
}

export const StarTop: React.FC<StarTopProps> = ({ state, height }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.9;
    const innerRadius = 0.4;
    
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - (Math.PI / 2); // Start at top
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.08,
      bevelSegments: 4
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state3, delta) => {
    if (!meshRef.current || !lightRef.current) return;

    const targetY = state === TreeMorphState.TREE_SHAPE ? height / 2 + 1.2 : height * 1.5;
    const targetScale = state === TreeMorphState.TREE_SHAPE ? 1 : 0.01;

    // Smooth movement
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 2.5);
    
    // Scale
    const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 2.5);
    meshRef.current.scale.setScalar(s);
    
    // Rotation: Spin + Slight Precession for elegance
    meshRef.current.rotation.y += delta * 0.8;
    meshRef.current.rotation.z = Math.sin(state3.clock.elapsedTime * 0.5) * 0.1; 
    
    // Light pulsing
    const pulse = Math.sin(state3.clock.elapsedTime * 3) * 0.2 + 1;
    lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity, 
        state === TreeMorphState.TREE_SHAPE ? 40 * pulse : 0, 
        delta * 3
    );
  });

  return (
    <group>
        <mesh ref={meshRef} position={[0, height * 1.5, 0]} geometry={starGeometry}>
          <meshStandardMaterial 
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.6}
              roughness={0.1}
              metalness={0.9}
          />
        </mesh>
        <pointLight ref={lightRef} distance={20} decay={2} color="#fff8d6" />
        
        {/* Inner Halo */}
        <pointLight position={[0, height/2 + 1.2, 0]} distance={4} decay={1} color="#FFD700" intensity={10} />
    </group>
  );
};