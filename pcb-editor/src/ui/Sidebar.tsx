import React from "react";

export type SelectedComponent = {
  id: string;
  type: "pad" | "trace" | "hole";
  position: { x: number; y: number; z: number };
  surfaceArea: number;
  layer: "top" | "bottom";
};

type SidebarProps = {
  selected?: SelectedComponent | null;
  onExport?: () => void;
  onClear?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ selected, onExport, onClear }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>PCB Inspector</h2>

      {!selected && (
        <p style={styles.placeholder}>
          Select a pad or trace to inspect details
        </p>
      )}

      {selected && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Selected Component</h3>

          <Info label="ID" value={selected.id} />
          <Info label="Type" value={selected.type} />
          <Info label="Layer" value={selected.layer} />

          <div style={styles.subSection}>
            <h4 style={styles.subTitle}>World Position</h4>
            <Info label="X" value={selected.position.x.toFixed(2)} />
            <Info label="Y" value={selected.position.y.toFixed(2)} />
            <Info label="Z" value={selected.position.z.toFixed(2)} />
          </div>

          <Info
            label="Surface Area"
            value={`${selected.surfaceArea.toFixed(2)} mm²`}
          />
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={onExport} style={styles.buttonPrimary}>
          Export JSON
        </button>

        <button onClick={onClear} style={styles.buttonSecondary}>
          Clear Board
        </button>
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <span style={styles.value}>{value}</span>
  </div>
);

export default Sidebar;

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "280px",
    height: "30vh",
    padding: "16px",
    background: "#0f1117",
    color: "#e5e7eb",
    fontFamily: "Inter, system-ui, sans-serif",
    borderLeft: "1px solid #1f2937",
  },
  title: {
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: 600,
  },
  placeholder: {
    fontSize: "13px",
    opacity: 0.7,
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
    textTransform: "uppercase",
    color: "#38bdf8",
  },
  subSection: {
    marginTop: "12px",
  },
  subTitle: {
    fontSize: "12px",
    opacity: 0.7,
    marginBottom: "4px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "4px",
  },
  label: {
    opacity: 0.7,
  },
  value: {
    fontWeight: 500,
  },
  actions: {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    right: "16px",
    display: "flex",
    gap: "8px",
  },
  buttonPrimary: {
    flex: 1,
    padding: "8px",
    background: "#38bdf8",
    color: "#000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonSecondary: {
    flex: 1,
    padding: "8px",
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
