// interaction/Selection.ts
import * as THREE from "three";

export class Selection {
  selected?: THREE.Object3D;

  select(object?: THREE.Object3D) {
    if (!object) {
      this.clear();
      return;
    }

    this.selected = object;
  }

  clear() {
    this.selected = undefined;
  }

  getData() {
    if (!this.selected) return null;

    return {
      id: this.selected.userData.id,
      type: this.selected.userData.type,
      layer: this.selected.userData.layer,
      mesh: this.selected,
    };
  }
}
