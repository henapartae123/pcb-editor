import { createBoard } from "../pcb/Board";

export function loadPCB(engineState: any, jsonString: string) {
  try {
    const data = JSON.parse(jsonString);

    // --- Clear existing ---
    engineState.components.forEach((comp: any) => {
      if (comp.mesh) engineState.scene.remove(comp.mesh);
      comp.geometry?.dispose();
      comp.material?.dispose();
    });
    engineState.components.clear();

    // --- Recreate board ---
    const board = createBoard(
      data.board.width,
      data.board.height,
      data.board.thickness
    );

    engineState.scene.add(board.mesh);

    engineState.components.set("board", {
      id: "board",
      type: "board",
      layer: "substrate",
      ...board,
    });

    return {
      success: true,
      boardConfig: data.board,
    };
  } catch (err) {
    console.error("Failed to load PCB:", err);
    return { success: false };
  }
}
