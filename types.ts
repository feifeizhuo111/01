import * as THREE from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  scatterRotation: THREE.Euler;
  treeRotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
  secondaryColor?: THREE.Color; // Used for ribbon/accent colors
  type: 'BOX' | 'ORNAMENT_GOLD' | 'ORNAMENT_WHITE' | 'ORNAMENT_BOX_RED' | 'RIBBON' | 'DECOR_HAT' | 'DECOR_CANDY' | 'DECOR_CANE' | 'DECOR_LIGHT';
  variant: number; // 0, 1, 2 etc. for different shapes/styles
}

export interface TreeConfig {
  height: number;
  radius: number;
  boxCount: number;
  ornamentCount: number;
  redBoxCount: number;
  decorCount: number;
  lightCount: number;
  ribbonSegmentCount: number;
  scatterRadius: number;
}