// Dapur Kilat — every tuning number, dish, ingredient and layout rect in one place.
// The kitchen is a fixed 1280x720 logical area; the renderer scales it to the window,
// so no rule below depends on the screen size.

/** The playfield's logical size. */
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** How many missed orders end the run. */
export const STRIKES_TO_END = 3;

/** The eight ingredient stations on the counter, in counter order. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', colour: '#f5efe0', dark: '#cbbf9d' },
  { id: 'mie', name: 'Mie', key: '2', colour: '#f2c94c', dark: '#c39a1e' },
  { id: 'ayam', name: 'Ayam', key: '3', colour: '#c96a3b', dark: '#8a4522' },
  { id: 'telur', name: 'Telur', key: '4', colour: '#fdf6e3', dark: '#e8d9a0' },
  { id: 'sayur', name: 'Sayur', key: '5', colour: '#4caf50', dark: '#2e7d32' },
  { id: 'sate', name: 'Sate', key: '6', colour: '#8d5524', dark: '#5d3615' },
  { id: 'bumbu', name: 'Bumbu', key: '7', colour: '#d32f2f', dark: '#8e1b1b' },
  { id: 'kecap', name: 'Kecap', key: '8', colour: '#3e2723', dark: '#1d0f0b' },
];

/** The five dishes on the menu: what each needs, what it pays, how long it cooks. */
export const DISHES = [
  { id: 'nasgor', name: 'Nasi Goreng Kilat', needs: ['nasi', 'telur', 'bumbu', 'kecap'], points: 100, cook: 4.0 },
  { id: 'mieayam', name: 'Mie Ayam', needs: ['mie', 'ayam', 'sayur', 'bumbu'], points: 100, cook: 4.0 },
  { id: 'sate', name: 'Sate Ayam', needs: ['sate', 'bumbu', 'kecap'], points: 90, cook: 3.5 },
  { id: 'gado', name: 'Gado-Gado', needs: ['sayur', 'telur', 'bumbu'], points: 90, cook: 3.0 },
  { id: 'sup', name: 'Sup Ayam', needs: ['ayam', 'sayur', 'telur'], points: 90, cook: 3.5 },
];

/** Seconds an order gives at level 1, and the least it ever gives. */
export const ORDER_TIME = { base: 32, perLevel: -2, min: 16 };

/** Seconds between new orders at level 1, and the least it ever is. */
export const SPAWN_TIME = { base: 8, perLevel: -0.6, min: 3.5 };

/** Orders on the board at once, at most. */
export const MAX_ORDERS = 3;

/** Burners on the stove. */
export const STOVE_BURNERS = 2;

/** Points for one correct ingredient, and per combo step on a serve. */
export const POINTS = { ingredient: 5, comboStep: 10 };

/** Serves per level-up. */
export const SERVES_PER_LEVEL = 5;

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'dapur-kilat.best';

/** The kitchen's palette: warm walls, tiled floor, wood counter, steel stove. */
export const PALETTE = {
  wall: '#f7c873',
  wallDark: '#eeb45a',
  floor: '#b0713c',
  floorLine: '#9a5f31',
  header: '#7c3f16',
  headerText: '#fff3d6',
  board: '#fff8e7',
  boardEdge: '#d9a441',
  ticket: '#ffffff',
  ticketEdge: '#d9c9a3',
  ticketSelected: '#ff8f00',
  ticketDone: '#c8e6c9',
  counter: '#8d5524',
  counterTop: '#a9713a',
  tile: '#fff3d6',
  tileEdge: '#d9a441',
  tileHot: '#ffe082',
  stove: '#455a64',
  stoveTop: '#37474f',
  burner: '#263238',
  flame: '#ff7043',
  plate: '#ffffff',
  plateEdge: '#b0bec5',
  pass: '#6d4c41',
  passTop: '#8d6e63',
  text: '#3e2723',
  muted: '#8d6e63',
  good: '#2e7d32',
  warn: '#ef6c00',
  bad: '#c62828',
  gold: '#f2c94c',
};

/** The font stack for every label. */
export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * The kitchen's fixed rectangles, shared by the renderer (what to paint) and the
 * input (what a click hits), so a click always lands where the picture says it does.
 */
export const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 56 },
  tickets: { y: 64, h: 132, w: 400, xs: [24, 440, 856] },
  plate: { cx: 216, cy: 388, r: 112 },
  plateLabel: { x: 32, y: 216, w: 368, h: 28 },
  tiles: { x: 444, y: 236, w: 96, h: 96, gap: 8, cols: 4 },
  stove: { x: 880, y: 216, w: 368, h: 324 },
  burners: [
    { cx: 972, cy: 330, r: 62 },
    { cx: 1156, cy: 330, r: 62 },
  ],
  stoveLabel: { x: 880, y: 216, w: 368, h: 28 },
  pass: { x: 24, y: 556, w: 1232, h: 84 },
  passCard: { w: 220, h: 64 },
  footer: { x: 0, y: 652, w: 1280, h: 68 },
};

/** Order time in seconds at a level. */
export function orderTimeAt(level) {
  return Math.max(ORDER_TIME.min, ORDER_TIME.base + ORDER_TIME.perLevel * (level - 1));
}

/** Spawn interval in seconds at a level. */
export function spawnTimeAt(level) {
  return Math.max(SPAWN_TIME.min, SPAWN_TIME.base + SPAWN_TIME.perLevel * (level - 1));
}

/** The level after `served` dishes. */
export function levelFor(served) {
  return 1 + Math.floor(served / SERVES_PER_LEVEL);
}

/** A dish by id. */
export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

/** An ingredient by id. */
export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id);
}
