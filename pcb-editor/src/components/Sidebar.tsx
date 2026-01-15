import React from "react";

interface SelectedComponent {
  id: string;
  type: "pad" | "hole" | "trace";
  position: [number, number, number];
  size?: [number, number]; // pads / traces
  radius?: number; // holes
  layer: "top" | "bottom";
}

interface SidebarProps {
  selectedComponent?: SelectedComponent | null;
  componentCount?: number;
  boardConfig?: {
    width: number;
    height: number;
    thickness: number;
  };

  /* Creation hooks */
  onAddPad?: () => void;
  onAddHole?: () => void;
  onAddTrace?: () => void;

  /* Persistence */
  onExport?: () => void;
  onClear?: () => void;
  onLoad?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedComponent = null,
  componentCount = 0,
  boardConfig = { width: 100, height: 80, thickness: 1.6 },

  onAddPad = () => {},
  onAddHole = () => {},
  onAddTrace = () => {},

  onExport = () => {},
  onClear = () => {},
  onLoad = () => {},
}) => {
  const calculateArea = (): number => {
    if (!selectedComponent) return 0;

    if (selectedComponent.size) {
      return selectedComponent.size[0] * selectedComponent.size[1];
    }

    if (selectedComponent.radius) {
      return Math.PI * selectedComponent.radius ** 2;
    }

    return 0;
  };

  const pos = selectedComponent?.position;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        minWidth: 270,
        padding: 20,
        borderRadius: 8,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        fontFamily: "monospace",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: 18,
          fontWeight: "bold",
          color: "#00d4ff",
          letterSpacing: 1,
        }}
      >
        PCB EDITOR
      </h2>

      {/* Board Info */}
      <section style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, opacity: 0.7 }}>BOARD</div>
        <div style={{ fontSize: 13 }}>
          {boardConfig.width} × {boardConfig.height} mm
        </div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>
          Thickness {boardConfig.thickness} mm
        </div>
      </section>

      {/* Creation */}
      <section
        style={{
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            opacity: 0.7,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Create
        </div>

        <ActionButton label="➕ Pad" onClick={onAddPad} />
        <ActionButton label="➕ Hole" onClick={onAddHole} />
        <ActionButton label="➕ Trace" onClick={onAddTrace} />
      </section>

      {/* Stats */}
      <section
        style={{
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.7 }}>Components</div>
        <div style={{ fontSize: 20, color: "#00d4ff", fontWeight: "bold" }}>
          {componentCount}
        </div>
      </section>

      {/* Selected */}
      {selectedComponent ? (
        <section
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 6,
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.3)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#00d4ff",
              marginBottom: 8,
            }}
          >
            SELECTED
          </div>

          <Info label="ID" value={selectedComponent.id} />
          <Info label="Type" value={selectedComponent.type} />

          {pos && (
            <Info
              label="Position"
              value={`(${pos[0].toFixed(2)}, ${pos[2].toFixed(2)})`}
            />
          )}

          {selectedComponent.size && (
            <Info
              label="Size"
              value={`${selectedComponent.size[0]} × ${selectedComponent.size[1]} mm`}
            />
          )}

          {selectedComponent.radius && (
            <Info
              label="Radius"
              value={`${selectedComponent.radius.toFixed(2)} mm`}
            />
          )}

          <Info label="Layer" value={selectedComponent.layer} />

          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid rgba(0,212,255,0.25)",
              fontSize: 12,
            }}
          >
            Area{" "}
            <strong style={{ color: "#00d4ff" }}>
              {calculateArea().toFixed(2)} mm²
            </strong>
          </div>
        </section>
      ) : (
        <div
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 6,
            textAlign: "center",
            opacity: 0.6,
            fontSize: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          No component selected
        </div>
      )}

      {/* Persistence */}
      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ActionButton
          label="📥 Export JSON"
          onClick={onExport}
          accent="green"
        />
        <ActionButton label="📤 Load JSON" onClick={onLoad} accent="blue" />
        <ActionButton label="🗑 Clear Board" onClick={onClear} accent="red" />
      </section>
    </div>
  );
};

export default Sidebar;

/* ---------- Helpers ---------- */

const Info = ({ label, value }: { label: string; value: string }) => (
  <div style={{ fontSize: 11, marginBottom: 4 }}>
    <span style={{ opacity: 0.7 }}>{label}:</span>{" "}
    <span style={{ color: "#fff" }}>{value}</span>
  </div>
);

const ActionButton = ({
  label,
  onClick,
  accent = "cyan",
}: {
  label: string;
  onClick: () => void;
  accent?: "cyan" | "green" | "blue" | "red";
}) => {
  const colors: any = {
    cyan: ["#00d4ff", "rgba(0,212,255,0.25)"],
    green: ["#00ff88", "rgba(0,200,100,0.25)"],
    blue: ["#00aaff", "rgba(0,150,255,0.25)"],
    red: ["#ff4444", "rgba(200,0,0,0.25)"],
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 1,
        cursor: "pointer",
        borderRadius: 6,
        border: `1px solid ${colors[accent][0]}`,
        background: colors[accent][1],
        color: colors[accent][0],
      }}
    >
      {label}
    </button>
  );
};
