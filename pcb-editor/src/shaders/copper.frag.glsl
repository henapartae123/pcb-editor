precision highp float;

uniform float uTime;
uniform float uHovered;
uniform float uSelected;
uniform vec3 uColor;
uniform vec3 uMaskTint;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vBarycentric;

/* ---------- Brushed Copper Grain ---------- */
float brushed(vec2 uv) {
  return sin(uv.x * 40.0 + sin(uv.y * 5.0)) * 0.1;
}

/* ---------- Edge Detection ---------- */
float edgeFactor() {
  vec3 d = fwidth(vBarycentric);
  vec3 a = smoothstep(vec3(0.0), d * 1.5, vBarycentric);
  return min(min(a.x, a.y), a.z);
}

void main() {
  vec3 normal = normalize(vNormal);

  // Stable fake light
  vec3 lightDir = normalize(vec3(0.3, 1.0, 0.4));
  float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);

  float grain = brushed(vPosition.xz);

  vec3 copper = uColor + grain;
  vec3 color = copper * diffuse;

  /* ---------- Hover Pulse ---------- */
  if (uHovered > 0.5) {
    float pulse = 0.5 + 0.5 * sin(uTime * 6.0);
    color += pulse * vec3(0.3, 0.2, 0.05);
  }

  /* ---------- Selection ---------- */
  if (uSelected > 0.5) {
    color = mix(color, vec3(1.0, 0.8, 0.3), 0.4);
  }

  /* ---------- Edge Outline ---------- */
  float edge = edgeFactor();
  vec3 edgeColor = vec3(0.08, 0.04, 0.01); // dark copper
  color = mix(edgeColor, color, edge);

  gl_FragColor = vec4(color, 1.0);
}
