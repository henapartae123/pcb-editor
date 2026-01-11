import * as THREE from "three";
import vertex from "./copper.vert.glsl?raw";
import fragment from "./copper.frag.glsl?raw";
import { copperUniforms } from "./uniforms";

export function createCopperMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(copperUniforms),
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: false,
  });
}
