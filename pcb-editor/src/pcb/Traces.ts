import * as THREE from "three";
import { createCopperMaterial } from "../shaders/createCopperMaterial";

interface DynamicTraceConfig {
  path: [number, number][]; // [x,z] points
  width: number;
  y: number;
}

export function createDynamicTrace(config: DynamicTraceConfig) {
  const { path, width, y } = config;
  const half = width / 2;

  const shapes: THREE.Shape[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const [x1, z1] = path[i];
    const [x2, z2] = path[i + 1];

    const shape = new THREE.Shape();

    const horizontal = Math.abs(z2 - z1) < 0.0001;
    const vertical = Math.abs(x2 - x1) < 0.0001;

    if (horizontal) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);

      shape.moveTo(minX, z1 - half);
      shape.lineTo(maxX, z1 - half);
      shape.lineTo(maxX, z1 + half);
      shape.lineTo(minX, z1 + half);
      shape.lineTo(minX, z1 - half);
    } else if (vertical) {
      const minZ = Math.min(z1, z2);
      const maxZ = Math.max(z1, z2);

      shape.moveTo(x1 - half, minZ);
      shape.lineTo(x1 + half, minZ);
      shape.lineTo(x1 + half, maxZ);
      shape.lineTo(x1 - half, maxZ);
      shape.lineTo(x1 - half, minZ);
    } else {
      // Safety fallback (should never happen in Manhattan routing)
      continue;
    }

    shapes.push(shape);
  }

  // Convert shapes to geometries
  const geometries: THREE.BufferGeometry[] = [];

  shapes.forEach((shape) => {
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2); // lay flat on XZ plane
    geometries.push(geo);
  });

  // Merge geometries manually
  const merged = new THREE.BufferGeometry();

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let indexOffset = 0;

  geometries.forEach((geo) => {
    const pos = geo.getAttribute("position");
    const norm = geo.getAttribute("normal");
    const uv = geo.getAttribute("uv");
    const idx = geo.getIndex();

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }

    for (let i = 0; i < norm.count; i++) {
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
    }

    for (let i = 0; i < uv.count; i++) {
      uvs.push(uv.getX(i), uv.getY(i));
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + indexOffset);
      }
    }

    indexOffset += pos.count;
  });

  merged.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);
  merged.computeBoundingSphere();

  const material = createCopperMaterial();
  const mesh = new THREE.Mesh(merged, material);
  mesh.position.y = y;

  mesh.userData = {
    type: "trace",
    path,
  };

  return { mesh };
}
