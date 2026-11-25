// Dapur Kilat's input: mouse and touch taps on the kitchen, plus the keyboard.
// Every hit test uses the same layout rectangles the renderer paints, so a click
// always lands where the picture says it does.

import { FIELD, INGREDIENTS, LAYOUT } from './config.js';

/** Confirm (start, restart, serve). */
export const ACTION_CONFIRM = 1;
/** Pause or resume. */
export const ACTION_PAUSE = 2;
/** Toggle sound. */
export const ACTION_MUTE = 4;

/** Turn a client point into kitchen coordinates. */
function toKitchen(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
  const ox = (rect.width - FIELD.width * scale) / 2;
  const oy = (rect.height - FIELD.height * scale) / 2;
  return { x: (clientX - rect.left - ox) / scale, y: (clientY - rect.top - oy) / scale };
}

/** Whether (x, y) is inside rect. */
function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** The input: actions queued since the last read, plus direct kitchen callbacks. */
export function createInput(canvas, hooks) {
  let actions = 0;
  const pressed = new Set();

  /** What a tap at kitchen point (x, y) means right now. */
  function tap(x, y, state) {
    // A ready plate on the pass is served first: it is the most urgent click.
    for (let i = 0; i < state.ready.length; i += 1) {
      const cx = LAYOUT.pass.x + 260 + i * (LAYOUT.passCard.w + 16);
      if (inside(x, y, { x: cx, y: LAYOUT.pass.y + 12, w: LAYOUT.passCard.w, h: LAYOUT.passCard.h })) {
        hooks.onServe();
        return;
      }
    }
    // An order ticket selects that order.
    for (let i = 0; i < state.orders.length; i += 1) {
      const order = state.orders[i];
      const tx = LAYOUT.tickets.xs[i];
      if (inside(x, y, { x: tx, y: LAYOUT.tickets.y, w: LAYOUT.tickets.w, h: LAYOUT.tickets.h })) {
        hooks.onSelect(order.id);
        return;
      }
    }
    // An ingredient tile adds that ingredient.
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      const col = i % LAYOUT.tiles.cols;
      const row = Math.floor(i / LAYOUT.tiles.cols);
      const tx = LAYOUT.tiles.x + col * (LAYOUT.tiles.w + LAYOUT.tiles.gap);
      const ty = LAYOUT.tiles.y + row * (LAYOUT.tiles.h + LAYOUT.tiles.gap);
      if (inside(x, y, { x: tx, y: ty, w: LAYOUT.tiles.w, h: LAYOUT.tiles.h })) {
        hooks.onIngredient(INGREDIENTS[i].id);
        return;
      }
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const point = toKitchen(canvas, event.clientX, event.clientY);
    if (hooks.state().screen === 'play') {
      tap(point.x, point.y, hooks.state());
    } else {
      actions |= ACTION_CONFIRM;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ') {
      event.preventDefault();
      actions |= ACTION_CONFIRM;
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'm') {
      actions |= ACTION_MUTE;
    } else if (/^[1-8]$/.test(key)) {
      const g = INGREDIENTS[Number(key) - 1];
      if (g !== undefined && hooks.state().screen === 'play') hooks.onIngredient(g.id);
    }
  });

  return {
    /** The actions queued since the last call, then cleared. */
    takeActions() {
      const out = actions;
      actions = 0;
      return out;
    },
    /** Whether a key is held down (kept for future movement input). */
    isPressed(key) {
      return pressed.has(key);
    },
  };
}
