/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";

export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m: { dispose: () => any }) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
