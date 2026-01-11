import * as THREE from "three";

export function createBoard(width: number, height: number, thickness: number) {
  const geometry = new THREE.BoxGeometry(width, thickness, height);

  const material = new THREE.MeshStandardMaterial({
    color: 0x00008c4a,
    roughness: 0.6,
    metalness: 0.5,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -thickness / 2;

  mesh.receiveShadow = true;
  mesh.userData = {
    id: "board",
    type: "board",
    layer: "board",
  };

  return { mesh, geometry, material };
}
