/* eslint-disable @typescript-eslint/no-explicit-any */
export function exportPCB(engineState: any, boardConfig: any): string {
  const components: any[] = [];

  engineState.components.forEach((comp: any) => {
    if (!comp.mesh) return;

    components.push({
      id: comp.id,
      type: comp.type,
      layer: comp.layer ?? (comp.type === "pad" ? "top" : "board"),
      position: [
        comp.mesh.position.x,
        comp.mesh.position.y,
        comp.mesh.position.z,
      ],
      size: comp.size ?? null,
      points: comp.points ?? null,
      width: comp.width ?? null,
    });
  });

  return JSON.stringify(
    {
      board: boardConfig,
      components,
    },
    null,
    2
  );
}

export function downloadPCB(json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pcb-layout.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
