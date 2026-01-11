import * as THREE from "three";

export function createRaycaster() {
  return {
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
  };
}
