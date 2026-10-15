/* Shared motion tokens — motion-components skill. Never hardcode springs elsewhere. */

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
export const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** tap/press feedback on buttons and tappable surfaces */
export const SPRING_PRESS = { type: "spring", stiffness: 500, damping: 30, mass: 0.6 } as const;
/** content swaps — labels/icons trading places */
export const SPRING_SWAP = { type: "spring", stiffness: 460, damping: 30, mass: 0.55 } as const;
/** overlay panel entrances — modals/sheets */
export const SPRING_PANEL = { type: "spring", stiffness: 420, damping: 40, mass: 0.5 } as const;
/** shared-layout glides — pills/indicators morphing between positions */
export const SPRING_LAYOUT = { type: "spring", stiffness: 360, damping: 32, mass: 0.6 } as const;
/** cursor-follow physics — magnetic/tilt */
export const SPRING_MOUSE = { type: "spring", stiffness: 200, damping: 15, mass: 0.3 } as const;
