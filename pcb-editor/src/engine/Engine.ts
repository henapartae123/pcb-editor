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
import { createManhattanTrace } from "../pcb/Traces";
import { setGlobalEngineState } from "../App";
import { createCopperMaterial } from "../shaders/createCopperMaterial";

const BOARD = { w: 100, h: 80, t: 1.6 };

const LAYERS = {
  TOP: 0.035,
};

const ROUTING = {
  grid: 1.25,
  width: 0.55,
};

const snap = (v: number) => Math.round(v / ROUTING.grid) * ROUTING.grid;

// 🔑 RELATIVE SNAP (prevents mirroring)
const snapRelative = (v: number) => snap(v + BOARD.w) - BOARD.w;

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

    /* ---------- PADS ---------- */
    const padMat = createCopperMaterial();

    const pads: THREE.Mesh[] = [];

    for (let i = 0; i < 12; i++) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(4, 0.04, 2), padMat);

      pad.position.set(
        snapRelative(-BOARD.w / 2 + 6),
        LAYERS.TOP,
        snapRelative(-BOARD.h / 2 + 10 + i * 5)
      );

      scene.add(pad);
      pads.push(pad);
      selectable.push(pad);

      components.set(pad.uuid, {
        id: pad.uuid,
        type: "pad",
        mesh: pad,
      });
    }

    /* ---------- HOLES ---------- */
    const holes: THREE.Group[] = [];

    pads.forEach((pad, i) => {
      const hole = createThroughHole({
        id: `hole-${i}`,
        x: snapRelative(12),
        z: pad.position.z,
        radius: 0.8,
        ringWidth: 1.3,
        thickness: BOARD.t,
      });

      hole.mesh.position.y = 0;
      scene.add(hole.mesh);

      holes.push(hole.mesh);
      selectable.push(hole.mesh);

      components.set(hole.mesh.uuid, {
        id: `hole-${i}`,
        type: "hole",
        mesh: hole.mesh,
      });
    });

    /* ---------- ROUTING ---------- */
    const traces: THREE.Mesh[] = [];

    const clearTraces = () => {
      traces.forEach((t) => {
        scene.remove(t);
        disposeObject(t);
      });
      traces.length = 0;
    };

    const routePadToHole = (
      pad: THREE.Mesh,
      hole: THREE.Group
    ): [number, number][] => {
      const px = snapRelative(pad.position.x);
      const pz = snapRelative(pad.position.z);
      const hx = snapRelative(hole.position.x);
      const hz = snapRelative(hole.position.z);

      const dx = hx - px;
      const dz = hz - pz;

      const path: [number, number][] = [];
      path.push([px, pz]);

      // 🔑 deterministic bend (NO MIRROR)
      if (Math.abs(dx) >= Math.abs(dz)) {
        path.push([hx, pz]);
      } else {
        path.push([px, hz]);
      }

      path.push([hx, hz]);
      return path;
    };

    const routeAll = () => {
      clearTraces();

      pads.forEach((pad, i) => {
        const hole = holes[i];
        if (!hole) return;

        const path = routePadToHole(pad, hole);

        const { mesh } = createManhattanTrace({
          path,
          width: ROUTING.width,
          y: LAYERS.TOP + 0.002,
        });

        scene.add(mesh);
        traces.push(mesh);
      });
    };

    routeAll();

    /* ---------- TRANSFORM CONTROLS ---------- */
    const transform = new TransformControls(camera, renderer.domElement);
    transform.setMode("translate");
    scene.add(transform);

    // Listen to object moves and update routing
    (transform as any).addEventListener("objectChange", () => {
      const obj = (transform as any).object as THREE.Object3D | null;
      if (!obj) return;

      // Snap Y to layer
      obj.position.y = LAYERS.TOP;

      // Snap X and Z to routing grid
      obj.position.x = snap(obj.position.x);
      obj.position.z = snap(obj.position.z);

      // Recalculate all routing traces
      routeAll();

      // Update selection callback
      if (onSelectionChange) {
        const c = components.get(obj.uuid);
        onSelectionChange(c || null);
      }
    });

    /* ---------- PICKING --c-------- */
    const updateMouse = (e: MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };

    renderer.domElement.addEventListener("click", (e) => {
      updateMouse(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(selectable, true);

      if (!hits.length) {
        transform.detach();
        onSelectionChange?.(null);
        return;
      }

      let obj = hits[0].object;
      while (obj.parent && !selectable.includes(obj)) {
        obj = obj.parent;
      }

      transform.attach(obj);
      onSelectionChange?.(components.get(obj.uuid));
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
      renderer.render(scene, camera);
      const t = performance.now() * 0.001;
      components.forEach((c) => {
        if (c.mesh.material?.uniforms?.uTime) {
          c.mesh.material.uniforms.uTime.value = t;
        }
      });
    };
    animate();

    engineRef.current = {
      scene,
      camera,
      renderer,
      components,
      traces,
      pads,
      holes,
    };
    setGlobalEngineState(engineRef.current);

    return () => {
      cancelAnimationFrame(raf);
      transform.dispose();
      components.forEach((c) => c.mesh && disposeObject(c.mesh));
      renderer.dispose();
      container.removeChild(renderer.domElement);
      engineRef.current = null;
    };
  }, []);
}
