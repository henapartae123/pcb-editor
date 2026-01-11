import * as THREE from "three";
import { createCopperMaterial } from "../shaders/createCopperMaterial";

interface ThroughHoleConfig {
  id: string;
  x: number;
  z: number;
  radius: number; // drill radius
  thickness: number; // board thickness
  ringWidth?: number; // copper ring width
}

export function createThroughHole(config: ThroughHoleConfig) {
  const ringWidth = config.ringWidth ?? 0.8;

  // ---- Drill (black cylinder) - properly oriented ----
  const drillGeo = new THREE.CylinderGeometry(
    config.radius,
    config.radius,
    config.thickness + 0.02,
    32, // radial segments - IMPORTANT for smooth cylinder
    1, // height segments
    false // open ended
  );

  const drillMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
    metalness: 0,
  });

  const drill = new THREE.Mesh(drillGeo, drillMat);
  // CylinderGeometry is oriented along Y axis by default
  // Position it so it goes through the board (centered at y=0)
  drill.position.set(config.x, 0, config.z);

  // ---- Copper annular ring (top) ----
  const ringGeo = new THREE.RingGeometry(
    config.radius,
    config.radius + ringWidth,
    48 // segments for smooth circle
  );

  const ringMat = createCopperMaterial();

  const ringTop = new THREE.Mesh(ringGeo, ringMat);
  ringTop.rotation.x = -Math.PI / 2; // Face up
  ringTop.position.set(config.x, config.thickness / 2 + 0.001, config.z);

  // ---- Copper annular ring (bottom) ----
  const ringBottom = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
  ringBottom.rotation.x = -Math.PI / 2; // Face up (same as top for consistency)
  ringBottom.position.set(config.x, -config.thickness / 2 - 0.001, config.z);

  // ---- Group ----
  const group = new THREE.Group();
  group.add(drill, ringTop, ringBottom);

  group.userData = {
    type: "hole",
    id: config.id,
    radius: config.radius,
  };

  return {
    mesh: group,
    drill,
    ringTop,
    ringBottom,
  };
}
