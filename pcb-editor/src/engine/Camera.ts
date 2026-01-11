import * as THREE from "three";

export function createCamera(width: number, height: number) {
  const aspect = width / height;
  const frustum = 80;

  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    0.1,
    1000
  );

  camera.position.set(0, 200, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1); // PCB convention

  return camera;
}
