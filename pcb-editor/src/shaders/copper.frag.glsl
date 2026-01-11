precision highp float;

uniform float uTime;
uniform float uHovered;
uniform float uSelected;
uniform vec3 uColor;
uniform vec3 uMaskTint;

varying vec3 vNormal;
varying vec3 vPosition;

// Simple brushed copper noise
float brushed(vec2 uv) {
  return sin(uv.x * 40.0 + sin(uv.y * 5.0)) * 0.1;
}

void main() {
  vec3 normal = normalize(vNormal);

  // Light direction (fake but stable)
  vec3 lightDir = normalize(vec3(0.3, 1.0, 0.4));
  float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);

  float grain = brushed(vPosition.xz);

  vec3 copper = uColor + grain;
  vec3 color = copper * diffuse;

  // Hover pulse
  if (uHovered > 0.5) {
    float pulse = 0.5 + 0.5 * sin(uTime * 6.0);
    color += pulse * vec3(0.3, 0.2, 0.05);
  }

  // Selected highlight
  if (uSelected > 0.5) {
    color = mix(color, vec3(1.0, 0.8, 0.3), 0.4);
  }

  gl_FragColor = vec4(color, 1.0);
}
