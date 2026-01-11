// interaction/Picking.ts
import * as THREE from "three";

export class Picking {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  dom: HTMLElement;
  camera: THREE.Camera;
  scene: THREE.Scene;

  constructor(dom: HTMLElement, camera: THREE.Camera, scene: THREE.Scene) {
    this.dom = dom;
    this.camera = camera;
    this.scene = scene;
  }

  updateMouse(event: MouseEvent) {
    const rect = this.dom.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  intersect(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.scene.children, true);
  }
}
