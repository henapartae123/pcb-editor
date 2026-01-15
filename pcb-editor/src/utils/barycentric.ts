import * as THREE from "three";

export function applyBarycentric(geometry: THREE.BufferGeometry) {
  const count = geometry.attributes.position.count;
  const bary = [];

  for (let i = 0; i < count; i += 3) {
    bary.push(1, 0, 0);
    bary.push(0, 1, 0);
    bary.push(0, 0, 1);
  }

  geometry.setAttribute(
    "barycentric",
    new THREE.Float32BufferAttribute(bary, 3)
  );
}
