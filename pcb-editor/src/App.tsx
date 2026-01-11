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

  useEngine(mountRef, (selection) => {
    setSelectedComponent(selection);
    if (globalEngineState) {
      setComponentCount(globalEngineState.components.size);
    }
  });

  // --- Export ---
  const handleExport = () => {
    if (!globalEngineState) return;
    const json = exportPCB(globalEngineState, boardConfig);
    downloadPCB(json);
  };

  // --- Load ---
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

  // --- Clear ---
  const handleClear = () => {
    if (!globalEngineState) return;

    // Dispose all component meshes
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

    // Dispose traces if stored
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
        onExport={handleExport}
        onLoad={handleLoad}
        onClear={handleClear}
      />
    </>
  );
}

export default App;
