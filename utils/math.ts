import * as THREE from 'three';
import { ParticleData, TreeConfig } from '../types';

const tempObj = new THREE.Object3D();

// Helper to get random point focused on LEFT or RIGHT sides
// This implements "Scattering to Left and Right" logic
const getSideScatterPoint = (radius: number): THREE.Vector3 => {
  // 1. Decide Side: Left (-1) or Right (+1)
  const side = Math.random() > 0.5 ? 1 : -1;
  
  // 2. X Position: Push out from center
  // Minimum distance to ensure center is empty (approx 15-20 units)
  const minX = radius * 0.4; 
  // Spread width
  const spreadX = radius * 0.6; 
  const x = side * (minX + Math.random() * spreadX);
  
  // 3. Y Position: Vertical spread
  const y = (Math.random() - 0.5) * radius * 0.8;
  
  // 4. Z Position: Depth
  const z = (Math.random() - 0.5) * radius * 0.6;
  
  return new THREE.Vector3(x, y, z);
};

export const generateTreeData = (config: TreeConfig): ParticleData[] => {
  const particles: ParticleData[] = [];
  let idCounter = 0;

  // 1. Generate Gift Boxes (Emerald & Bronze Mix)
  // Variants: 0=Cube, 1=Tall, 2=Wide, 4=FlatSquare
  for (let i = 0; i < config.boxCount; i++) {
    const normalized = i / config.boxCount;
    // Height from bottom to top
    const y = (normalized * config.height) - (config.height / 2);
    
    // Cone radius at this height
    const rPct = 1 - normalized; 
    const currentRadius = config.radius * Math.pow(rPct, 0.85);

    // Distribution: Golden Angle spiral
    const theta = i * 2.39996; 
    // Fill volume slightly
    const r = currentRadius * Math.sqrt(0.2 + 0.8 * Math.random()); 

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const pos = new THREE.Vector3(x, y, z);
    
    // Orientation: ORGANIC STACKING
    // Base Y rotation (facing out mostly)
    const rotY = Math.random() * Math.PI * 2;
    // Add slight "Jiggle" to X and Z to make it look like a natural pile, not a grid
    const rotX = (Math.random() - 0.5) * 0.35; 
    const rotZ = (Math.random() - 0.5) * 0.35;

    const rot = new THREE.Euler(rotX, rotY, rotZ);

    // Determine Style: Emerald/Gold (60%) or Bronze/Teal (40%)
    const isSecondary = Math.random() < 0.40;
    
    let color: THREE.Color;
    let ribbonColor: THREE.Color;

    if (isSecondary) {
      // Bronze/Amber Box, Deep Teal Ribbon
      color = new THREE.Color('#B45309').lerp(new THREE.Color('#D97706'), Math.random() * 0.4); 
      ribbonColor = new THREE.Color('#064E3B'); // Deep Emerald Ribbon
    } else {
      // Emerald Box, Gold Ribbon
      color = new THREE.Color('#065F46').lerp(new THREE.Color('#022c22'), Math.random() * 0.6);
      ribbonColor = new THREE.Color('#FCD34D'); // Bright Gold
    }

    // Pick Variant (0, 1, 2, 4)
    const rand = Math.random();
    let variant = 0;
    if (rand < 0.35) variant = 0;     // Cube 
    else if (rand < 0.55) variant = 1; // Tall 
    else if (rand < 0.75) variant = 2; // Wide 
    else variant = 4;                 // Flat 
    
    // Base scale per variant
    let baseScale = 1.0;
    if (variant === 0) baseScale = 0.85 + Math.random() * 0.25; 
    if (variant === 1) baseScale = 0.75 + Math.random() * 0.25; 
    if (variant === 2) baseScale = 0.75 + Math.random() * 0.25; 
    if (variant === 4) baseScale = 0.95 + Math.random() * 0.2; 

    particles.push({
      id: idCounter++,
      type: 'BOX',
      variant: variant,
      scatterPosition: getSideScatterPoint(config.scatterRadius),
      treePosition: pos,
      scatterRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      treeRotation: rot,
      scale: baseScale, 
      color: color,
      secondaryColor: ribbonColor
    });
  }

  // 2. Generate Ornaments (Gold & Pearl Spheres)
  for (let i = 0; i < config.ornamentCount; i++) {
    const hPct = Math.pow(Math.random(), 1.6); 

    const y = (hPct * config.height) - (config.height / 2);
    const rPct = 1 - hPct;
    const currentConeRadius = config.radius * Math.pow(rPct, 0.85);
    
    const theta = i * 2.39996 + (Math.random() * 0.5); 
    const layerOffset = 0.3 + (Math.random() * 0.5); 
    const r = currentConeRadius + layerOffset;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const type = Math.random() > 0.6 ? 'ORNAMENT_GOLD' : 'ORNAMENT_WHITE';
    const color = type === 'ORNAMENT_GOLD' 
        ? new THREE.Color('#FFD700') 
        : new THREE.Color('#E5E7EB'); 

    const sizeMultiplier = 1.0 + (1.0 - hPct) * 1.8;
    const baseScale = 0.25 + Math.random() * 0.25;
    const finalScale = baseScale * sizeMultiplier;

    particles.push({
      id: idCounter++,
      type,
      variant: 0,
      scatterPosition: getSideScatterPoint(config.scatterRadius),
      treePosition: new THREE.Vector3(x, y, z),
      scatterRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      treeRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: finalScale,
      color,
    });
  }

  // 3. Generate Bottom Ring Boxes (Mix Red & Yellow)
  // PLACEMENT: Ring around the bottom
  for (let i = 0; i < config.redBoxCount; i++) {
    const yOffset = (Math.random() * 1.2); 
    const y = (-config.height / 2) + yOffset;
    
    // Radius: Ring around base
    const r = config.radius + 0.8 + (Math.random() * 1.2); 
    
    // Evenly distributed angle
    const theta = (i / config.redBoxCount) * Math.PI * 2 + (Math.random() * 0.2);

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const rot = new THREE.Euler(
        (Math.random() - 0.5) * 0.6, 
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.6
    );

    const rand = Math.random();
    let variant = 0;
    if (rand < 0.5) variant = 0;
    else if (rand < 0.8) variant = 1;
    else variant = 2; // Round

    // Alternate colors: Red vs Yellow
    const isRed = Math.random() > 0.5;
    let boxColor, ribbonColor;
    
    if (isRed) {
        // Red Box with Gold Ribbon
        boxColor = new THREE.Color('#D90429'); 
        ribbonColor = new THREE.Color('#FFD700');
    } else {
        // Yellow Box with Green Ribbon
        boxColor = new THREE.Color('#FDE047');
        ribbonColor = new THREE.Color('#064E3B');
    }

    particles.push({
      id: idCounter++,
      type: 'ORNAMENT_BOX_RED', // Identifier type
      variant: variant,
      scatterPosition: getSideScatterPoint(config.scatterRadius),
      treePosition: new THREE.Vector3(x, y, z),
      scatterRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      treeRotation: rot,
      scale: 1.2 + Math.random() * 0.4, 
      color: boxColor, 
      secondaryColor: ribbonColor, 
    });
  }

  // 4. Generate Christmas Decors (Hat, Candy, Cane)
  for (let i = 0; i < config.decorCount; i++) {
    const hPct = Math.random() * 0.85; 
    const y = (hPct * config.height) - (config.height / 2);
    const rPct = 1 - hPct;
    const currentConeRadius = config.radius * Math.pow(rPct, 0.85);
    
    const theta = Math.random() * Math.PI * 2; 
    const r = currentConeRadius + 0.9; 

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const rnd = Math.random();
    let type: 'DECOR_HAT' | 'DECOR_CANDY' | 'DECOR_CANE' = 'DECOR_CANE';
    if (rnd < 0.33) type = 'DECOR_HAT';
    else if (rnd < 0.66) type = 'DECOR_CANDY';
    
    const rot = new THREE.Euler(
      (Math.random() - 0.5) * 0.6,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.6
    );

    if (type === 'DECOR_CANE') {
       rot.x = (Math.random() - 0.5) * 0.8;
       rot.z = (Math.random() - 0.5) * 0.8;
    }

    particles.push({
      id: idCounter++,
      type: type,
      variant: 0,
      scatterPosition: getSideScatterPoint(config.scatterRadius),
      treePosition: new THREE.Vector3(x, y, z),
      scatterRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      treeRotation: rot,
      scale: 0.9 + Math.random() * 0.3, 
      color: new THREE.Color('#FFFFFF'), 
    });
  }

  // 5. Generate Twinkling Fairy Lights
  for (let i = 0; i < config.lightCount; i++) {
    const hPct = Math.random(); 
    const y = (hPct * config.height) - (config.height / 2);
    const rPct = 1 - hPct;
    const currentConeRadius = config.radius * Math.pow(rPct, 0.85);

    const theta = Math.random() * Math.PI * 2; 
    const r = currentConeRadius + 0.5 + (Math.random() * 0.3); 

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    
    particles.push({
      id: idCounter++,
      type: 'DECOR_LIGHT',
      variant: 0,
      scatterPosition: getSideScatterPoint(config.scatterRadius),
      treePosition: new THREE.Vector3(x, y, z),
      scatterRotation: new THREE.Euler(0, 0, 0),
      treeRotation: new THREE.Euler(0, 0, 0),
      scale: 1.0, 
      color: new THREE.Color('#FFF5E1'),
    });
  }

  // 6. Generate Ribbon
  const turns = 5;
  for (let i = 0; i < config.ribbonSegmentCount; i++) {
    const t = i / config.ribbonSegmentCount;
    const angle = t * Math.PI * 2 * turns;
    
    const y = (t * config.height) - (config.height / 2);
    const rPct = 1 - t;
    const r = (config.radius * Math.pow(rPct, 0.85)) + 1.25; 

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const pos = new THREE.Vector3(x, y, z);

    const nextT = (i + 1) / config.ribbonSegmentCount;
    const nextAngle = nextT * Math.PI * 2 * turns;
    const nextY = (nextT * config.height) - (config.height / 2);
    const nextRPct = 1 - nextT;
    const nextR = (config.radius * Math.pow(nextRPct, 0.85)) + 1.25;
    const nextX = Math.cos(nextAngle) * nextR;
    const nextZ = Math.sin(nextAngle) * nextR;
    
    tempObj.position.copy(pos);
    tempObj.lookAt(nextX, nextY, nextZ);
    tempObj.rotateZ(Math.PI / 2);

    particles.push({
      id: idCounter++,
      type: 'RIBBON',
      variant: 0,
      scatterPosition: getSideScatterPoint(config.scatterRadius),
      treePosition: pos,
      scatterRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      treeRotation: tempObj.rotation.clone(),
      scale: 1, 
      color: new THREE.Color('#D90429'), 
    });
  }

  return particles;
};