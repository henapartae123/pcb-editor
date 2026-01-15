/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { useEngine } from "./engine/Engine";
import Sidebar from "./components/Sidebar";
import { exportPCB, downloadPCB } from "./serialization/exportPCB";
import { loadPCB } from "./serialization/loadPCB";

let globalEngineState: any = null;
export const setGlobalEngineState = (state: any) => {
  globalEngineState = state;
};

function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [componentCount, setComponentCount] = useState(0);
  const [boardConfig, setBoardConfig] = useState({
    width: 100,
    height: 80,
    thickness: 1.6,
  });

  /* ---------- ENGINE ---------- */
  useEngine(mountRef, (selection) => {
    setSelectedComponent(selection);
    if (globalEngineState?.components) {
      setComponentCount(globalEngineState.components.size);
    }
  });

  /* ---------- SIDEBAR ACTIONS ---------- */
  const handleAddPad = () => {
    globalEngineState?.api?.addPad?.();
    setComponentCount(globalEngineState?.components.size ?? 0);
  };

  const handleAddHole = () => {
    globalEngineState?.api?.addHole?.();
    setComponentCount(globalEngineState?.components.size ?? 0);
  };

  const handleStartTrace = () => {
    globalEngineState?.api?.startTrace?.();
  };

  const handleStopTrace = () => {
    globalEngineState?.api?.stopTrace?.();
  };

  /* ---------- EXPORT ---------- */
  const handleExport = () => {
    if (!globalEngineState) return;
    const json = exportPCB(globalEngineState, boardConfig);
    downloadPCB(json);
  };

  /* ---------- LOAD ---------- */
  const handleLoad = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = loadPCB(globalEngineState, reader.result as string);
        if (result.success) setBoardConfig(result.boardConfig);
        setSelectedComponent(null);
        setComponentCount(globalEngineState?.components.size ?? 0);
      };
      reader.readAsText(file);
    };

    input.click();
  };

  /* ---------- CLEAR ---------- */
  const handleClear = () => {
    if (!globalEngineState) return;

    globalEngineState.components.forEach((comp: any) => {
      if (comp.mesh) {
        globalEngineState.scene.remove(comp.mesh);
        comp.mesh.geometry?.dispose();
        if (Array.isArray(comp.mesh.material)) {
          comp.mesh.material.forEach((m: any) => m.dispose());
        } else {
          comp.mesh.material?.dispose();
        }
      }
    });

    globalEngineState.components.clear();

    if (globalEngineState.traces) {
      globalEngineState.traces.forEach((t: any) => {
        globalEngineState.scene.remove(t);
        t.geometry?.dispose();
        if (Array.isArray(t.material)) {
          t.material.forEach((m: any) => m.dispose());
        } else {
          t.material?.dispose();
        }
      });
      globalEngineState.traces = [];
    }

    setSelectedComponent(null);
    setComponentCount(0);
  };

  return (
    <>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />

      <Sidebar
        selectedComponent={selectedComponent}
        componentCount={componentCount}
        boardConfig={boardConfig}
        onAddPad={handleAddPad}
        onAddHole={handleAddHole}
        onAddTrace={handleStartTrace}
        onExport={handleExport}
        onLoad={handleLoad}
        onClear={handleClear}
      />
    </>
  );
}

export default App;
