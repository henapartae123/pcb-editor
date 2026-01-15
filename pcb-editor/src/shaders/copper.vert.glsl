attribute vec3 barycentric;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vBarycentric;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vBarycentric = barycentric;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
