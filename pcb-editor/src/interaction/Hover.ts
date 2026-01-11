/* eslint-disable @typescript-eslint/no-explicit-any */
// interaction/Hover.ts
import * as THREE from "three";

export class Hover {
  private last?: THREE.Object3D;
  private originalMaterial?: THREE.Material;

  set(object?: THREE.Object3D) {
    if (this.last && this.originalMaterial) {
      (this.last as any).material = this.originalMaterial;
    }

    if (!object || !(object as any).material) return;

    this.last = object;
    this.originalMaterial = (object as any).material;

    (object as any).material = (
      this.originalMaterial as THREE.Material
    ).clone();
    ((object as any).material as THREE.Material).transparent = true;
    ((object as any).material as THREE.Material).opacity = 0.7;
  }

  clear() {
    if (this.last && this.originalMaterial) {
      (this.last as any).material = this.originalMaterial;
    }
    this.last = undefined;
    this.originalMaterial = undefined;
  }
}
