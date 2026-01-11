import * as THREE from "three";
import { createCopperMaterial } from "../shaders/createCopperMaterial";

interface ManhattanTraceConfig {
  path: [number, number][]; // XY pairs on PCB plane
  width: number;
  y?: number; // Y position (height)
}

export function createManhattanTrace(config: ManhattanTraceConfig) {
  const { path, width } = config;
  const halfWidth = width / 2;

  // Create the trace geometry using lines with rectangular cross-section
  const shapes: THREE.Shape[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const [x1, z1] = path[i];
    const [x2, z2] = path[i + 1];

    const shape = new THREE.Shape();

    // Determine if this is a horizontal or vertical segment
    const isHorizontal = Math.abs(z2 - z1) < 0.001;
    const isVertical = Math.abs(x2 - x1) < 0.001;

    if (isHorizontal) {
      // Horizontal segment
      const xMin = Math.min(x1, x2);
      const xMax = Math.max(x1, x2);

      shape.moveTo(xMin, z1 - halfWidth);
      shape.lineTo(xMax, z1 - halfWidth);
      shape.lineTo(xMax, z1 + halfWidth);
      shape.lineTo(xMin, z1 + halfWidth);
      shape.lineTo(xMin, z1 - halfWidth);
    } else if (isVertical) {
      // Vertical segment
      const zMin = Math.min(z1, z2);
      const zMax = Math.max(z1, z2);

      shape.moveTo(x1 - halfWidth, zMin);
      shape.lineTo(x1 + halfWidth, zMin);
      shape.lineTo(x1 + halfWidth, zMax);
      shape.lineTo(x1 - halfWidth, zMax);
      shape.lineTo(x1 - halfWidth, zMin);
    } else {
      // Diagonal segment (shouldn't happen in Manhattan routing, but handle it)
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const perpAngle = angle + Math.PI / 2;

      const dx = Math.cos(perpAngle) * halfWidth;
      const dz = Math.sin(perpAngle) * halfWidth;

      shape.moveTo(x1 - dx, z1 - dz);
      shape.lineTo(x2 - dx, z2 - dz);
      shape.lineTo(x2 + dx, z2 + dz);
      shape.lineTo(x1 + dx, z1 + dz);
      shape.lineTo(x1 - dx, z1 - dz);
    }

    shapes.push(shape);
  }

  // Combine all shapes into one geometry
  const geometries: THREE.ShapeGeometry[] = [];

  shapes.forEach((shape) => {
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane
    geometries.push(geo);
  });

  // Merge all geometries
  const mergedGeo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  let indexOffset = 0;

  geometries.forEach((geo) => {
    const posAttr = geo.getAttribute("position");
    const normalAttr = geo.getAttribute("normal");
    const uvAttr = geo.getAttribute("uv");
    const indexAttr = geo.getIndex();

    // Add positions
    for (let i = 0; i < posAttr.count; i++) {
      positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }

    // Add normals
    for (let i = 0; i < normalAttr.count; i++) {
      normals.push(normalAttr.getX(i), normalAttr.getY(i), normalAttr.getZ(i));
    }

    // Add UVs
    for (let i = 0; i < uvAttr.count; i++) {
      uvs.push(uvAttr.getX(i), uvAttr.getY(i));
    }

    // Add indices with offset
    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i++) {
        indices.push(indexAttr.getX(i) + indexOffset);
      }
    }

    indexOffset += posAttr.count;
  });

  mergedGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  mergedGeo.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(normals, 3)
  );
  mergedGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  mergedGeo.setIndex(indices);

  const mat = createCopperMaterial();

  const mesh = new THREE.Mesh(mergedGeo, mat);
  mesh.position.y = config.y ?? 0.03;

  mesh.userData = {
    type: "trace",
    path: config.path,
  };

  return { mesh };
}
