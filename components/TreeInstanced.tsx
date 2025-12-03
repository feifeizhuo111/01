import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticleData, TreeMorphState } from '../types';

interface TreeInstancedProps {
  data: ParticleData[];
  state: TreeMorphState;
}

const tempObj = new THREE.Object3D();
const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const axisY = new THREE.Vector3(0, 1, 0);

// Reusable Vectors for offsets
const OFFSET_X_POS = new THREE.Vector3(0.2, 0, 0);
const OFFSET_X_NEG = new THREE.Vector3(-0.2, 0, 0);

// --- GEOMETRIES ---

// --- Green Gift Variants ---
const G_V0_GEO = new THREE.BoxGeometry(0.7, 0.7, 0.7);
const G_V0_RIB_A = new THREE.BoxGeometry(0.72, 0.7, 0.12);
const G_V0_RIB_B = new THREE.BoxGeometry(0.12, 0.7, 0.72);

const G_V1_GEO = new THREE.BoxGeometry(0.5, 0.9, 0.5);
const G_V1_RIB_A = new THREE.BoxGeometry(0.52, 0.9, 0.12);

const G_V2_GEO = new THREE.BoxGeometry(0.9, 0.45, 0.7);
const G_V2_RIB_A = new THREE.BoxGeometry(0.92, 0.12, 0.72);

const G_V4_GEO = new THREE.BoxGeometry(0.8, 0.25, 0.8);
const G_V4_RIB_A = new THREE.BoxGeometry(0.82, 0.25, 0.08); 
const G_V4_RIB_B = new THREE.BoxGeometry(0.82, 0.25, 0.08); 

// --- Red Gift Variants ---
const R_V0_GEO = new THREE.BoxGeometry(0.35, 0.35, 0.35);
const R_V0_RIB_A = new THREE.BoxGeometry(0.36, 0.35, 0.08);
const R_V0_RIB_B = new THREE.BoxGeometry(0.08, 0.35, 0.36);

const R_V1_GEO = new THREE.BoxGeometry(0.3, 0.5, 0.3);
const R_V1_RIB_A = new THREE.BoxGeometry(0.32, 0.5, 0.08);

const R_V2_GEO = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 24);
const R_V2_RIB_A = new THREE.CylinderGeometry(0.205, 0.205, 0.08, 24);

// --- Ornaments & Ribbon ---
const ORNAMENT_GEOMETRY = new THREE.SphereGeometry(0.25, 32, 32);

// RIBBON - Width 0.4
const RIBBON_SEGMENT_GEO = new THREE.BoxGeometry(0.4, 0.02, 0.6);

// --- Decor Geometries ---
const HAT_CONE_GEO = new THREE.ConeGeometry(0.25, 0.6, 24);
HAT_CONE_GEO.translate(0, 0.3, 0); 
const HAT_TRIM_GEO = new THREE.TorusGeometry(0.25, 0.08, 12, 24);
HAT_TRIM_GEO.rotateX(Math.PI / 2); 
const HAT_POM_GEO = new THREE.SphereGeometry(0.08, 12, 12);
HAT_POM_GEO.translate(0, 0.6, 0); 

const CANDY_CORE_GEO = new THREE.SphereGeometry(0.2, 16, 16);
const CANDY_WRAP_GEO = new THREE.ConeGeometry(0.15, 0.3, 16);
CANDY_WRAP_GEO.rotateZ(Math.PI / 2); 
CANDY_WRAP_GEO.translate(0.3, 0, 0); 

const canePath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0.5, 0),
  new THREE.Vector3(0.15, 0.65, 0),
  new THREE.Vector3(0.3, 0.5, 0)
]);
const CANE_GEO = new THREE.TubeGeometry(canePath, 20, 0.06, 8, false);
CANE_GEO.translate(-0.1, -0.3, 0);

// --- LIGHT GEOMETRY ---
const LIGHT_GEO = new THREE.IcosahedronGeometry(0.08, 0);

// Reuse constant Euler
const ROT_180_Y = new THREE.Euler(0, Math.PI, 0);


export const TreeInstanced: React.FC<TreeInstancedProps> = ({ data, state }) => {
  // --- Refs ---
  const gV0Ref = useRef<THREE.InstancedMesh>(null);
  const gV1Ref = useRef<THREE.InstancedMesh>(null);
  const gV2Ref = useRef<THREE.InstancedMesh>(null);
  const gV4Ref = useRef<THREE.InstancedMesh>(null);

  const ornamentRef = useRef<THREE.InstancedMesh>(null);
  const spiralRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null);

  const rV0Ref = useRef<THREE.InstancedMesh>(null);
  const rV1Ref = useRef<THREE.InstancedMesh>(null);
  const rV2Ref = useRef<THREE.InstancedMesh>(null);

  // Ribbons
  const gV0RibARef = useRef<THREE.InstancedMesh>(null);
  const gV0RibBRef = useRef<THREE.InstancedMesh>(null);
  const gV1RibARef = useRef<THREE.InstancedMesh>(null);
  const gV2RibARef = useRef<THREE.InstancedMesh>(null);
  const gV4RibARef = useRef<THREE.InstancedMesh>(null);
  const gV4RibBRef = useRef<THREE.InstancedMesh>(null);

  const rV0RibARef = useRef<THREE.InstancedMesh>(null);
  const rV0RibBRef = useRef<THREE.InstancedMesh>(null);
  const rV1RibARef = useRef<THREE.InstancedMesh>(null);
  const rV2RibARef = useRef<THREE.InstancedMesh>(null);

  // Decors
  const hatRedRef = useRef<THREE.InstancedMesh>(null);
  const hatWhiteRef = useRef<THREE.InstancedMesh>(null);
  const hatPomRef = useRef<THREE.InstancedMesh>(null);
  
  const candyRedRef = useRef<THREE.InstancedMesh>(null);
  const candyWhiteRef = useRef<THREE.InstancedMesh>(null); 
  const candyWhiteRef2 = useRef<THREE.InstancedMesh>(null); 

  const caneRef = useRef<THREE.InstancedMesh>(null);

  const progress = useRef(0);

  // Filter Data
  const { gV0, gV1, gV2, gV4, ornaments, spiral, rV0, rV1, rV2, dHat, dCandy, dCane, dLights } = useMemo(() => {
    return {
      gV0: data.filter(d => d.type === 'BOX' && d.variant === 0),
      gV1: data.filter(d => d.type === 'BOX' && d.variant === 1),
      gV2: data.filter(d => d.type === 'BOX' && d.variant === 2),
      gV4: data.filter(d => d.type === 'BOX' && d.variant === 4),
      ornaments: data.filter(d => d.type === 'ORNAMENT_GOLD' || d.type === 'ORNAMENT_WHITE'),
      spiral: data.filter(d => d.type === 'RIBBON'),
      rV0: data.filter(d => d.type === 'ORNAMENT_BOX_RED' && d.variant === 0),
      rV1: data.filter(d => d.type === 'ORNAMENT_BOX_RED' && d.variant === 1),
      rV2: data.filter(d => d.type === 'ORNAMENT_BOX_RED' && d.variant === 2),
      dHat: data.filter(d => d.type === 'DECOR_HAT'),
      dCandy: data.filter(d => d.type === 'DECOR_CANDY'),
      dCane: data.filter(d => d.type === 'DECOR_CANE'),
      dLights: data.filter(d => d.type === 'DECOR_LIGHT'),
    };
  }, [data]);

  // Set Colors
  useLayoutEffect(() => {
    const setColors = (
        mesh: THREE.InstancedMesh | null, 
        items: ParticleData[], 
        overrideColor?: string,
        useSecondary?: boolean
    ) => {
      if (mesh && items.length > 0) {
        const c = new THREE.Color();
        items.forEach((p, i) => {
             if (overrideColor) {
                 c.set(overrideColor);
             } else if (useSecondary && p.secondaryColor) {
                 c.copy(p.secondaryColor);
             } else {
                 c.copy(p.color);
             }
             mesh.setColorAt(i, c);
        });
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    };

    setColors(gV0Ref.current, gV0);
    setColors(gV1Ref.current, gV1);
    setColors(gV2Ref.current, gV2);
    setColors(gV4Ref.current, gV4);

    setColors(gV0RibARef.current, gV0, undefined, true);
    setColors(gV0RibBRef.current, gV0, undefined, true);
    setColors(gV1RibARef.current, gV1, undefined, true);
    setColors(gV2RibARef.current, gV2, undefined, true);
    setColors(gV4RibARef.current, gV4, undefined, true);
    setColors(gV4RibBRef.current, gV4, undefined, true);

    setColors(rV0Ref.current, rV0);
    setColors(rV1Ref.current, rV1);
    setColors(rV2Ref.current, rV2);

    setColors(rV0RibARef.current, rV0, undefined, true);
    setColors(rV0RibBRef.current, rV0, undefined, true);
    setColors(rV1RibARef.current, rV1, undefined, true);
    setColors(rV2RibARef.current, rV2, undefined, true);

    setColors(ornamentRef.current, ornaments);
    setColors(spiralRef.current, spiral);
    setColors(lightsRef.current, dLights);
    
    setColors(hatRedRef.current, dHat, '#C90000');
    setColors(hatWhiteRef.current, dHat, '#F8F9FA');
    setColors(hatPomRef.current, dHat, '#F8F9FA');

    setColors(candyRedRef.current, dCandy, '#C90000');
    setColors(candyWhiteRef.current, dCandy, '#F8F9FA');
    setColors(candyWhiteRef2.current, dCandy, '#F8F9FA');

    setColors(caneRef.current, dCane, '#C90000');

  }, [gV0, gV1, gV2, gV4, ornaments, spiral, rV0, rV1, rV2, dHat, dCandy, dCane, dLights]);

  useFrame((stateThree, delta) => {
    const targetProgress = state === TreeMorphState.TREE_SHAPE ? 1 : 0;
    // Slower animation speed (delta * 0.6) for a more majestic feel
    progress.current = THREE.MathUtils.lerp(progress.current, targetProgress, delta * 0.6);
    const globalT = progress.current;
    
    const time = stateThree.clock.elapsedTime;

    const updateLayer = (
      mesh: THREE.InstancedMesh | null, 
      particles: ParticleData[], 
      scaleMultiplier: number = 1,
      extras: { 
        mesh: THREE.InstancedMesh | null, 
        offsetPos?: THREE.Vector3,
        offsetRot?: THREE.Euler,
        scaleOverrides?: THREE.Vector3 
      }[] = [],
      isTwinkling: boolean = false
    ) => {
      if (!mesh) return;
      
      particles.forEach((p, i) => {
        const yNorm = (p.treePosition.y + 7) / 14; 
        const delay = (1.0 - yNorm) * 0.6;
        const duration = 0.4;
        let localT = (globalT - delay) / duration;
        localT = THREE.MathUtils.clamp(localT, 0, 1);
        
        // ease
        const easedT = localT < 0.5 ? 4 * localT * localT * localT : 1 - Math.pow(-2 * localT + 2, 3) / 2;

        tempPos.lerpVectors(p.scatterPosition, p.treePosition, easedT);
        
        if (state === TreeMorphState.TREE_SHAPE && easedT < 1.0) {
            // Increased spiral rotation factor (3.0 * PI) for more swirling
            const spin = (1.0 - easedT) * Math.PI * 3.0; 
            tempPos.applyAxisAngle(axisY, spin);
        }

        if (globalT < 0.1) {
          tempPos.y += Math.sin(time + p.id * 0.1) * 0.2;
        }

        tempObj.rotation.copy(p.scatterRotation);
        const qStart = tempObj.quaternion.clone();
        tempObj.rotation.copy(p.treeRotation);
        const qEnd = tempObj.quaternion.clone();
        tempQuat.slerpQuaternions(qStart, qEnd, easedT);

        let s = p.scale * scaleMultiplier;
        
        if (state === TreeMorphState.TREE_SHAPE) {
            const appear = easedT;
            s *= (appear > 0.9 ? 1 : appear * 1.1); 
            if (s > p.scale * scaleMultiplier) s = p.scale * scaleMultiplier;
        } else {
             s *= (0.5 + 0.5 * easedT); 
        }

        if (isTwinkling) {
             const pulse = Math.sin(time * 3 + p.id * 123.45) * 0.5 + 0.5; 
             const twinkleScale = 0.5 + 0.8 * pulse; 
             s *= twinkleScale;
        }

        tempScale.set(s, s, s);

        tempObj.position.copy(tempPos);
        tempObj.quaternion.copy(tempQuat);
        tempObj.scale.copy(tempScale);
        tempObj.updateMatrix();
        mesh.setMatrixAt(i, tempObj.matrix);

        extras.forEach(extra => {
          if (!extra.mesh) return;
          
          tempObj.position.copy(tempPos);
          tempObj.quaternion.copy(tempQuat);
          tempObj.scale.copy(tempScale);
          
          if (extra.scaleOverrides) {
              tempObj.scale.multiply(extra.scaleOverrides);
          }

          if (extra.offsetPos) {
             const vOffset = extra.offsetPos.clone().multiplyScalar(s);
             vOffset.applyQuaternion(tempQuat);
             tempObj.position.add(vOffset);
          }
          
          if (extra.offsetRot) {
              const localQ = new THREE.Quaternion().setFromEuler(extra.offsetRot);
              tempObj.quaternion.multiply(localQ);
          }
          
          tempObj.updateMatrix();
          extra.mesh.setMatrixAt(i, tempObj.matrix);
        });
      });
      mesh.instanceMatrix.needsUpdate = true;
      extras.forEach(e => { if(e.mesh) e.mesh.instanceMatrix.needsUpdate = true; });
    };

    updateLayer(gV0Ref.current, gV0, 1.0, [{ mesh: gV0RibARef.current }, { mesh: gV0RibBRef.current }]);
    updateLayer(gV1Ref.current, gV1, 1.0, [{ mesh: gV1RibARef.current }]);
    updateLayer(gV2Ref.current, gV2, 1.0, [{ mesh: gV2RibARef.current }]);
    
    // Use reusable vector constants here
    updateLayer(gV4Ref.current, gV4, 1.0, [
        { mesh: gV4RibARef.current, offsetPos: OFFSET_X_POS },
        { mesh: gV4RibBRef.current, offsetPos: OFFSET_X_NEG }
    ]);

    updateLayer(ornamentRef.current, ornaments, 1.0);
    updateLayer(spiralRef.current, spiral, 1.0);
    updateLayer(lightsRef.current, dLights, 1.0, [], true);

    updateLayer(rV0Ref.current, rV0, 1.0, [{ mesh: rV0RibARef.current }, { mesh: rV0RibBRef.current }]);
    updateLayer(rV1Ref.current, rV1, 1.0, [{ mesh: rV1RibARef.current }]);
    updateLayer(rV2Ref.current, rV2, 1.0, [{ mesh: rV2RibARef.current }]);

    updateLayer(hatRedRef.current, dHat, 1.0, [
        { mesh: hatWhiteRef.current }, 
        { mesh: hatPomRef.current }   
    ]);
    
    updateLayer(candyRedRef.current, dCandy, 1.0, [
        { mesh: candyWhiteRef.current }, 
        { mesh: candyWhiteRef2.current, offsetRot: ROT_180_Y } 
    ]);

    updateLayer(caneRef.current, dCane, 1.2);

  });

  // --- Materials ---
  const boxMat = <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.3} envMapIntensity={1.2} />;
  const ribbonMat = <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.8} envMapIntensity={1.5} />;
  const ornamentMat = <meshStandardMaterial roughness={0.05} metalness={0.95} envMapIntensity={2.0} />;
  const bigRibbonMat = <meshStandardMaterial color="#D90429" roughness={0.2} metalness={0.5} emissive="#500000" emissiveIntensity={0.1} side={THREE.DoubleSide} />;
  const redDecorMat = <meshStandardMaterial color="#C90000" roughness={0.3} metalness={0.2} envMapIntensity={0.8} />;
  const whiteDecorMat = <meshStandardMaterial color="#F8F9FA" roughness={0.8} metalness={0.0} envMapIntensity={0.5} />;
  const lightMat = <meshStandardMaterial color="#FFF5E1" emissive="#FFD700" emissiveIntensity={4.0} toneMapped={false} />;

  return (
    <group>
      {/* Green/Bronze Boxes */}
      <instancedMesh ref={gV0Ref} args={[G_V0_GEO, undefined, gV0.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={gV0RibARef} args={[G_V0_RIB_A, undefined, gV0.length]}>{ribbonMat}</instancedMesh>
      <instancedMesh ref={gV0RibBRef} args={[G_V0_RIB_B, undefined, gV0.length]}>{ribbonMat}</instancedMesh>

      <instancedMesh ref={gV1Ref} args={[G_V1_GEO, undefined, gV1.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={gV1RibARef} args={[G_V1_RIB_A, undefined, gV1.length]}>{ribbonMat}</instancedMesh>

      <instancedMesh ref={gV2Ref} args={[G_V2_GEO, undefined, gV2.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={gV2RibARef} args={[G_V2_RIB_A, undefined, gV2.length]}>{ribbonMat}</instancedMesh>

      <instancedMesh ref={gV4Ref} args={[G_V4_GEO, undefined, gV4.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={gV4RibARef} args={[G_V4_RIB_A, undefined, gV4.length]}>{ribbonMat}</instancedMesh>
      <instancedMesh ref={gV4RibBRef} args={[G_V4_RIB_B, undefined, gV4.length]}>{ribbonMat}</instancedMesh>

      {/* Ornaments */}
      <instancedMesh ref={ornamentRef} args={[ORNAMENT_GEOMETRY, undefined, ornaments.length]} castShadow receiveShadow>
        {ornamentMat}
      </instancedMesh>

      {/* Fairy Lights */}
      <instancedMesh ref={lightsRef} args={[LIGHT_GEO, undefined, dLights.length]}>
        {lightMat}
      </instancedMesh>

      {/* Spiral Ribbon */}
      <instancedMesh ref={spiralRef} args={[RIBBON_SEGMENT_GEO, undefined, spiral.length]} castShadow receiveShadow>
        {bigRibbonMat}
      </instancedMesh>

      {/* Bottom Ring Boxes */}
      <instancedMesh ref={rV0Ref} args={[R_V0_GEO, undefined, rV0.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={rV0RibARef} args={[R_V0_RIB_A, undefined, rV0.length]}>{ribbonMat}</instancedMesh>
      <instancedMesh ref={rV0RibBRef} args={[R_V0_RIB_B, undefined, rV0.length]}>{ribbonMat}</instancedMesh>

      <instancedMesh ref={rV1Ref} args={[R_V1_GEO, undefined, rV1.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={rV1RibARef} args={[R_V1_RIB_A, undefined, rV1.length]}>{ribbonMat}</instancedMesh>

      <instancedMesh ref={rV2Ref} args={[R_V2_GEO, undefined, rV2.length]} castShadow receiveShadow>{boxMat}</instancedMesh>
      <instancedMesh ref={rV2RibARef} args={[R_V2_RIB_A, undefined, rV2.length]}>{ribbonMat}</instancedMesh>
      
      {/* Decors */}
      <instancedMesh ref={hatRedRef} args={[HAT_CONE_GEO, undefined, dHat.length]} castShadow receiveShadow>{redDecorMat}</instancedMesh>
      <instancedMesh ref={hatWhiteRef} args={[HAT_TRIM_GEO, undefined, dHat.length]}>{whiteDecorMat}</instancedMesh>
      <instancedMesh ref={hatPomRef} args={[HAT_POM_GEO, undefined, dHat.length]}>{whiteDecorMat}</instancedMesh>

      <instancedMesh ref={candyRedRef} args={[CANDY_CORE_GEO, undefined, dCandy.length]} castShadow receiveShadow>{redDecorMat}</instancedMesh>
      <instancedMesh ref={candyWhiteRef} args={[CANDY_WRAP_GEO, undefined, dCandy.length]}>{whiteDecorMat}</instancedMesh>
      <instancedMesh ref={candyWhiteRef2} args={[CANDY_WRAP_GEO, undefined, dCandy.length]}>{whiteDecorMat}</instancedMesh>
      
      <instancedMesh ref={caneRef} args={[CANE_GEO, undefined, dCane.length]} castShadow receiveShadow>{redDecorMat}</instancedMesh>
    </group>
  );
};