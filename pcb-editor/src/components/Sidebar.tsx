import React from "react";

interface SidebarProps {
  selectedComponent?: {
    id: string;
    type: string;
    position: [number, number, number];
    size?: [number, number];
    radius?: number;
    layer: string;
  } | null;
  componentCount?: number;
  boardConfig?: {
    width: number;
    height: number;
    thickness: number;
  };
  onExport?: () => void;
  onClear?: () => void;
  onLoad?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedComponent = null,
  componentCount = 120,
  boardConfig = { width: 100, height: 80, thickness: 1.6 },
  onExport = () => {},
  onClear = () => {},
  onLoad = () => {},
}) => {
  const calculateArea = (): number => {
    if (!selectedComponent) return 0;

    if (selectedComponent.size) {
      return selectedComponent.size[0] * selectedComponent.size[1];
    } else if (selectedComponent.radius) {
      return Math.PI * selectedComponent.radius * selectedComponent.radius;
    }

    return 0;
  };
  const pos = selectedComponent?.position;

  const inputStyle = {
    width: "100%",
    padding: "6px",
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "4px",
    color: "#fff",
    fontFamily: "monospace",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
        padding: "20px",
        borderRadius: "8px",
        color: "#fff",
        fontFamily: "monospace",
        minWidth: "260px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <h2
        style={{
          margin: "0 0 15px 0",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#00d4ff",
          letterSpacing: "1px",
        }}
      >
        PCB EDITOR
      </h2>

      {/* Board Info */}
      <div
        style={{
          marginBottom: "20px",
          paddingBottom: "15px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            marginBottom: "6px",
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Board Dimensions
        </div>
        <div style={{ fontSize: "13px", marginBottom: "4px" }}>
          {boardConfig.width} × {boardConfig.height} mm
        </div>
        <div style={{ fontSize: "11px", opacity: 0.7 }}>
          Thickness: {boardConfig.thickness} mm
        </div>
      </div>

      {/* PCB Controls */}
      {/* <div
        style={{
          marginBottom: "20px",
          paddingBottom: "15px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            marginBottom: "10px",
            opacity: 0.7,
            textTransform: "uppercase",
          }}
        >
          PCB Generation
        </div>

        <label
          style={{ fontSize: "11px", display: "block", marginBottom: "6px" }}
        >
          Pads
        </label>
        <input type="number" defaultValue={120} style={inputStyle} />

        <label style={{ fontSize: "11px", display: "block", marginTop: "8px" }}>
          Holes
        </label>
        <input type="number" defaultValue={20} style={inputStyle} />

        <label style={{ fontSize: "11px", display: "block", marginTop: "8px" }}>
          Trace Width
        </label>
        <input type="number" step="0.1" defaultValue={0.6} style={inputStyle} />
      </div> */}

      {/* Component Count */}
      <div
        style={{
          marginBottom: "20px",
          paddingBottom: "15px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            marginBottom: "6px",
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Total Components
        </div>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00d4ff" }}>
          {componentCount}
        </div>
      </div>

      {/* Selected Component */}
      {selectedComponent ? (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            background: "rgba(0, 212, 255, 0.1)",
            borderRadius: "6px",
            border: "1px solid rgba(0, 212, 255, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#00d4ff",
            }}
          >
            SELECTED
          </div>

          <div style={{ fontSize: "11px", lineHeight: "1.8" }}>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ opacity: 0.7 }}>ID:</span>{" "}
              <span style={{ color: "#fff" }}>{selectedComponent.id}</span>
            </div>

            <div style={{ marginBottom: "4px" }}>
              <span style={{ opacity: 0.7 }}>Type:</span>{" "}
              <span style={{ color: "#fff" }}>{selectedComponent.type}</span>
            </div>

            {pos && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ opacity: 0.7 }}>Position:</span>{" "}
                <span style={{ color: "#fff" }}>
                  ({pos[0].toFixed(2)}, {pos[2].toFixed(2)})
                </span>
              </div>
            )}

            {selectedComponent.size && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ opacity: 0.7 }}>Size:</span>{" "}
                <span style={{ color: "#fff" }}>
                  {selectedComponent.size[0]} × {selectedComponent.size[1]} mm
                </span>
              </div>
            )}

            {selectedComponent.radius && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ opacity: 0.7 }}>Radius:</span>{" "}
                <span style={{ color: "#fff" }}>
                  {selectedComponent.radius.toFixed(2)} mm
                </span>
              </div>
            )}

            <div style={{ marginBottom: "4px" }}>
              <span style={{ opacity: 0.7 }}>Layer:</span>{" "}
              <span style={{ color: "#fff", textTransform: "capitalize" }}>
                {selectedComponent.layer}
              </span>
            </div>

            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(0, 212, 255, 0.2)",
              }}
            >
              <span style={{ opacity: 0.7 }}>Surface Area:</span>{" "}
              <span style={{ color: "#00d4ff", fontWeight: "bold" }}>
                {calculateArea().toFixed(2)} mm²
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "12px",
            textAlign: "center",
            opacity: 0.6,
          }}
        >
          No component selected
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={onExport}
          style={{
            padding: "12px",
            background: "rgba(0, 200, 100, 0.2)",
            border: "1px solid rgba(0, 200, 100, 0.5)",
            borderRadius: "6px",
            color: "#00ff88",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 200, 100, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 200, 100, 0.2)";
          }}
        >
          📥 Export JSON
        </button>

        <button
          onClick={onLoad}
          style={{
            padding: "12px",
            background: "rgba(0, 150, 255, 0.2)",
            border: "1px solid rgba(0, 150, 255, 0.5)",
            borderRadius: "6px",
            color: "#00aaff",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 150, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 150, 255, 0.2)";
          }}
        >
          📤 Load JSON
        </button>

        <button
          onClick={onClear}
          style={{
            padding: "12px",
            background: "rgba(200, 0, 0, 0.2)",
            border: "1px solid rgba(200, 0, 0, 0.5)",
            borderRadius: "6px",
            color: "#ff4444",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(200, 0, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(200, 0, 0, 0.2)";
          }}
        >
          🗑️ Clear Board
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
