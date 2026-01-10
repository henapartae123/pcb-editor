import { useRef } from "react";
import { useEngine } from "./engine/Engine";
import Sidebar from "./ui/Sidebar";

function App() {
  const mountRef = useRef(null);

  useEngine(mountRef);

  return (
    <>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
      <Sidebar />
    </>
  );
}

export default App;
