/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TransformControls } from "three-stdlib";

import { createRenderer } from "./Renderer";
import { createCamera } from "./Camera";
import { createScene } from "./Scene";
import { createRaycaster } from "./Raycaster";
import { disposeObject } from "./Dispose";

import { createBoard } from "../pcb/Board";
import { createThroughHole } from "../pcb/Holes";
import { createDynamicTrace } from "../pcb/Traces";
import { setGlobalEngineState } from "../App";
import { createCopperMaterial } from "../shaders/createCopperMaterial";

const BOARD = { w: 100, h: 80, t: 1.6 };
const LAYERS = { TOP: 0.035 };
const GRID = 1.25;

const snap = (v: number) => Math.round(v / GRID) * GRID;

/* ---------- BARYCENTRIC ---------- */
function applyBarycentric(geometry: THREE.BufferGeometry) {
  const count = geometry.attributes.position.count;
  const bary: number[] = [];
  for (let i = 0; i < count; i += 3) {
    bary.push(1, 0, 0, 0, 1, 0, 0, 0, 1);
  }
  geometry.setAttribute(
    "barycentric",
    new THREE.Float32BufferAttribute(bary, 3)
  );
}

export function useEngine(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onSelectionChange?: (data: any | null) => void
) {
  const engineRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;
    const container = containerRef.current;

    /* ---------- CORE ---------- */
    const renderer = createRenderer(container);
    const scene = createScene();
    const camera = createCamera(container.clientWidth, container.clientHeight);
    const { raycaster, mouse } = createRaycaster();

    camera.position.set(0, 140, 0.001);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sun = new THREE.DirectionalLight(0xffffff, 0.7);
    sun.position.set(80, 140, 80);
    scene.add(sun);

    const components = new Map<string, any>();
    const selectable: THREE.Object3D[] = [];

    /* ---------- BOARD ---------- */
    const board = createBoard(BOARD.w, BOARD.h, BOARD.t);
    board.mesh.position.y = -BOARD.t / 2;
    scene.add(board.mesh);

    /* ---------- FACTORIES ---------- */

    const register = (root: THREE.Object3D, type: string) => {
      selectable.push(root);
      components.set(root.uuid, { id: root.uuid, type, mesh: root });
    };

    const createPad = (x = 0, z = 0) => {
      const geo = new THREE.BoxGeometry(4, 0.04, 2);
      applyBarycentric(geo);

      const mat = createCopperMaterial();
      const pad = new THREE.Mesh(geo, mat);
      pad.position.set(snap(x), LAYERS.TOP, snap(z));

      scene.add(pad);
      register(pad, "pad");
      return pad;
    };

    const createHole = (x = 0, z = 0) => {
      const hole = createThroughHole({
        id: `hole-${crypto.randomUUID()}`,
        x: snap(x),
        z: snap(z),
        radius: 0.8,
        ringWidth: 1.3,
        thickness: BOARD.t,
      });

      hole.mesh.traverse((o: any) => {
        if (!o.isMesh) return;
        applyBarycentric(o.geometry);
        if (o.material?.uniforms) {
          o.material.uniforms.uHovered.value = 0;
          o.material.uniforms.uSelected.value = 0;
        }
      });

      scene.add(hole.mesh);
      register(hole.mesh, "hole");
      return hole.mesh;
    };

    const createTrace = (start: THREE.Vector3, end: THREE.Vector3) => {
      const x1 = snap(start.x);
      const z1 = snap(start.z);
      const x2 = snap(end.x);
      const z2 = snap(end.z);

      // Avoid zero length
      if (x1 === x2 && z1 === z2) return;

      const path: [number, number][] = [[x1, z1]];

      const dx = Math.abs(x2 - x1);
      const dz = Math.abs(z2 - z1);

      // Choose bend direction (Manhattan routing)
      if (dx > dz) {
        // horizontal first, then vertical
        path.push([x2, z1]);
      } else {
        // vertical first, then horizontal
        path.push([x1, z2]);
      }

      path.push([x2, z2]);

      const { mesh } = createDynamicTrace({
        path,
        width: 0.55,
        y: LAYERS.TOP + 0.002,
      });

      applyBarycentric(mesh.geometry);
      scene.add(mesh);
      register(mesh, "trace");

      return mesh;
    };

    /* ---------- TRACE MODE ---------- */
    let traceStart: THREE.Vector3 | null = null;
    let traceActive = false;

    const startTrace = () => {
      traceActive = true;
      traceStart = null;
    };

    const stopTrace = () => {
      traceActive = false;
      traceStart = null;
    };

    /* ---------- TRANSFORM ---------- */
    const transform = new TransformControls(camera, renderer.domElement);
    transform.setMode("translate");
    transform.showY = false;
    scene.add(transform);

    transform.addEventListener("objectChange", () => {
      const obj = transform.object;
      if (!obj) return;
      obj.position.x = snap(obj.position.x);
      obj.position.z = snap(obj.position.z);
      obj.position.y = LAYERS.TOP;
      onSelectionChange?.(components.get(obj.uuid));
    });

    /* ---------- INTERACTION ---------- */
    let hovered: THREE.Object3D | null = null;

    const setUniform = (root: THREE.Object3D, key: string, v: number) => {
      root.traverse((o: any) => {
        if (o.material?.uniforms?.[key]) {
          o.material.uniforms[key].value = v;
        }
      });
    };

    renderer.domElement.addEventListener("mousemove", (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hit =
        raycaster.intersectObjects(selectable, true)[0]?.object || null;

      let root = hit;
      while (root && !components.has(root.uuid) && root.parent) {
        root = root.parent;
      }

      if (hovered && hovered !== root) {
        setUniform(hovered, "uHovered", 0);
        hovered = null;
      }

      if (root && root !== hovered) {
        hovered = root;
        setUniform(root, "uHovered", 1);
        renderer.domElement.style.cursor = "pointer";
      } else if (!root) {
        renderer.domElement.style.cursor = "default";
      }
    });

    renderer.domElement.addEventListener("click", () => {
      /** ✅ SAFETY GUARD */
      if (traceActive && !hovered) return;

      if (traceActive && hovered) {
        const pos = hovered.position.clone();

        if (!traceStart) {
          traceStart = pos;
        } else {
          createTrace(traceStart, pos);

          traceStart = null;
          traceActive = false;
        }
        return;
      }

      components.forEach((c) => setUniform(c.mesh, "uSelected", 0));

      if (!hovered) {
        transform.detach();
        onSelectionChange?.(null);
        return;
      }

      setUniform(hovered, "uSelected", 1);
      transform.attach(hovered);
      onSelectionChange?.(components.get(hovered.uuid));
    });

    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      camera.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
      camera.zoom = THREE.MathUtils.clamp(camera.zoom, 0.6, 12);
      camera.updateProjectionMatrix();
    });

    /* ---------- LOOP ---------- */
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      components.forEach((c) =>
        c.mesh.traverse(
          (o: any) =>
            o.material?.uniforms?.uTime && (o.material.uniforms.uTime.value = t)
        )
      );
      renderer.render(scene, camera);
    };
    animate();

    /* ---------- EXPOSE API ---------- */
    engineRef.current = {
      scene,
      camera,
      renderer,
      components,
      api: {
        addPad: () => createPad(),
        addHole: () => createHole(),
        startTrace,
        stopTrace,
      },
    };

    setGlobalEngineState(engineRef.current);

    return () => {
      cancelAnimationFrame(raf);
      transform.dispose();
      components.forEach((c) => disposeObject(c.mesh));
      renderer.dispose();
      container.removeChild(renderer.domElement);
      engineRef.current = null;
    };
  }, []);
}
