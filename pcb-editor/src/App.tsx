/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { useEngine } from "./engine/Engine";
import Sidebar from "./components/Sidebar";
import { exportPCB, downloadPCB } from "./serialization/exportPCB";
// import { loadPCB } from "./serialization/loadPCB";

let globalEngineState: any = null;
// eslint-disable-next-line react-refresh/only-export-components
export const setGlobalEngineState = (state: any) => {
  globalEngineState = state;
};

function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [componentCount, setComponentCount] = useState(1);

  const [boardConfig] = useState({
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

  const handleExport = () => {
    if (!globalEngineState) return;
    const json = exportPCB(globalEngineState, boardConfig);
    downloadPCB(json);
  };

  // const handleLoad = () => {
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = ".json";

  //   input.onchange = (e: any) => {
  //     const file = e.target.files[0];
  //     if (!file) return;

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const result = loadPCB(globalEngineState, reader.result as string);
  //       if (result.success) setBoardConfig(result.boardConfig);
  //     };
  //     reader.readAsText(file);
  //   };

  //   input.click();
  // };

  const handleClear = () => {
    if (!globalEngineState) return;

    globalEngineState.components.forEach((comp: any) => {
      if (comp.mesh) globalEngineState.scene.remove(comp.mesh);
    });

    globalEngineState.components.clear();
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
        // onLoad={handleLoad}
        onClear={handleClear}
      />
    </>
  );
}

export default App;
