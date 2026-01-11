import * as THREE from "three";
import { createCopperMaterial } from "../shaders/createCopperMaterial";

interface PadConfig {
  count: number;
  width: number;
  height: number;
  boardWidth: number;
  boardHeight: number;
}

export function createPads(config: PadConfig) {
  const group = new THREE.Group();
  group.name = "pads";

  const geometry = new THREE.BoxGeometry(
    config.width,
    0.02, // thin copper
    config.height
  );

  const material = createCopperMaterial();

  for (let i = 0; i < config.count; i++) {
    const pad = new THREE.Mesh(geometry, material);
    pad.name = `pad-${i}`;

    pad.position.set(
      THREE.MathUtils.randFloat(
        -config.boardWidth / 2 + config.width,
        config.boardWidth / 2 - config.width
      ),
      0.02,
      THREE.MathUtils.randFloat(
        -config.boardHeight / 2 + config.height,
        config.boardHeight / 2 - config.height
      )
    );

    pad.userData = {
      id: pad.name,
      type: "pad",
      layer: "top",
      width: config.width,
      height: config.height,
    };

    pad.renderOrder = 10;
    pad.frustumCulled = false;

    group.add(pad);
  }

  return { mesh: group };
}
