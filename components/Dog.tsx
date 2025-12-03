import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';

interface DogProps {
  state: TreeMorphState;
  height: number;
  radius: number;
}

export const Dog: React.FC<DogProps> = ({ state, height, radius }) => {
  const groupRef = useRef<THREE.Group>(null);
  const slideProgress = useRef(1.0); 

  useFrame((stateThree, delta) => {
    if (!groupRef.current) return;

    if (state === TreeMorphState.SCATTERED) {
      groupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
      return;
    }

    groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);

    slideProgress.current -= delta * 0.03; 
    if (slideProgress.current < 0) {
      slideProgress.current = 1.0; 
    }

    const t = slideProgress.current;
    
    const turns = 5;
    const angle = t * Math.PI * 2 * turns;
    
    const y = (t * height) - (height / 2);
    const rPct = 1 - t;
    const r = (radius * Math.pow(rPct, 0.85)) + 1.2; 
    
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    
    const nextT = t - 0.01;
    const nextAngle = nextT * Math.PI * 2 * turns;
    const nextY = (nextT * height) - (height / 2);
    const nextRPct = 1 - nextT;
    const nextR = (radius * Math.pow(nextRPct, 0.85)) + 1.2;
    const nextX = Math.cos(nextAngle) * nextR;
    const nextZ = Math.sin(nextAngle) * nextR;

    groupRef.current.position.set(x, y + 0.35, z); 
    groupRef.current.lookAt(nextX, nextY, nextZ);

    const sway = Math.sin(stateThree.clock.elapsedTime * 2) * 0.1;
    groupRef.current.rotation.z += sway;
  });

  const furMaterial = <meshStandardMaterial color="#fffaf0" roughness={1.0} metalness={0} />;
  const darkMaterial = <meshStandardMaterial color="#222" roughness={0.4} />;

  return (
    <group ref={groupRef} dispose={null}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]} rotation={[-0.4, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.35, 0.5]} />
        {furMaterial}
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.5, 0.2]} rotation={[0.4, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        {furMaterial}
      </mesh>
      
      {/* Ears */}
      <mesh position={[0.16, 0.58, 0.2]} rotation={[0.4, 0, 0.3]} castShadow>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        {furMaterial}
      </mesh>
      <mesh position={[-0.16, 0.58, 0.2]} rotation={[0.4, 0, -0.3]} castShadow>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        {furMaterial}
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0.46, 0.38]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.12]} />
        {furMaterial}
      </mesh>
      <mesh position={[0, 0.51, 0.45]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.035]} />
        {darkMaterial}
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.09, 0.56, 0.37]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.03]} />
        {darkMaterial}
      </mesh>
      <mesh position={[-0.09, 0.56, 0.37]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.03]} />
        {darkMaterial}
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.25, -0.25]} rotation={[0.8, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.25]} />
        {furMaterial}
      </mesh>

      {/* Rear Paws */}
      <mesh position={[0.16, 0.1, 0.2]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.13, 0.15, 0.25]} />
        {furMaterial}
      </mesh>
      <mesh position={[-0.16, 0.1, 0.2]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.13, 0.15, 0.25]} />
        {furMaterial}
      </mesh>

      {/* Front Paws */}
      <mesh position={[0.14, 0.25, 0.35]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.11, 0.2, 0.11]} />
        {furMaterial}
      </mesh>
      <mesh position={[-0.14, 0.25, 0.35]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.11, 0.2, 0.11]} />
        {furMaterial}
      </mesh>
    </group>
  );
};