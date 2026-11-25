// Dapur Kilat's painter: every pixel of the kitchen is drawn here, flat colours and
// thick outlines, so the game reads at a glance even shrunk to a contact sheet.
// One canvas, one logical 1280x720 kitchen, scaled to the window.

import { FIELD, FONT, INGREDIENTS, LAYOUT, PALETTE, dishById, ingredientById } from './config.js';

/** The title screen. */
export const SCREEN_TITLE = 'title';
/** Normal play. */
export const SCREEN_PLAY = 'play';
/** Paused. */
export const SCREEN_PAUSED = 'paused';
/** The run ended. */
export const SCREEN_OVER = 'over';

/** Round a rectangle's corners. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A filled circle. */
function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** One ingredient's little picture, drawn in a box of `size` around (cx, cy). */
export function drawIngredientIcon(ctx, id, cx, cy, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.strokeStyle = 'rgba(62,39,35,0.55)';
  if (id === 'nasi') {
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.62, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    circle(ctx, -s * 0.28, -s * 0.1, s * 0.3);
    circle(ctx, s * 0.05, -s * 0.28, s * 0.34);
    circle(ctx, s * 0.32, -s * 0.05, s * 0.26);
    ctx.stroke();
  } else if (id === 'mie') {
    ctx.fillStyle = '#e8b23a';
    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.6, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = Math.max(3, size * 0.09);
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.15 + i * s * 0.22);
      ctx.quadraticCurveTo(-s * 0.2, -s * 0.35 + i * s * 0.22, 0, -s * 0.15 + i * s * 0.22);
      ctx.quadraticCurveTo(s * 0.25, s * 0.05 + i * s * 0.22, s * 0.5, -s * 0.15 + i * s * 0.22);
      ctx.stroke();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#c96a3b';
    circle(ctx, -s * 0.1, -s * 0.1, s * 0.5);
    ctx.fillStyle = '#f5efe0';
    ctx.fillRect(s * 0.2, -s * 0.05, s * 0.55, s * 0.14);
    circle(ctx, s * 0.78, -s * 0.18, s * 0.14);
    circle(ctx, s * 0.78, s * 0.16, s * 0.14);
  } else if (id === 'telur') {
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.68, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b705';
    circle(ctx, 0, 0, s * 0.3);
  } else if (id === 'sayur') {
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(-s * 0.25, -s * 0.1, s * 0.34, s * 0.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.25, -s * 0.1, s * 0.34, s * 0.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef6c00';
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.1);
    ctx.lineTo(s * 0.15, s * 0.1);
    ctx.lineTo(0, s * 0.62);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'sate') {
    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, s * 0.3);
    ctx.lineTo(s * 0.6, -s * 0.3);
    ctx.stroke();
    ctx.fillStyle = '#6d3b12';
    for (let i = 0; i < 3; i += 1) {
      const t = -0.35 + i * 0.35;
      ctx.save();
      ctx.translate(t * s, -t * s);
      ctx.rotate(-0.5);
      ctx.fillRect(-s * 0.22, -s * 0.22, s * 0.44, s * 0.44);
      ctx.restore();
    }
  } else if (id === 'bumbu') {
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.55, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#d32f2f';
    circle(ctx, -s * 0.2, -s * 0.15, s * 0.26);
    circle(ctx, s * 0.15, -s * 0.25, s * 0.3);
    circle(ctx, s * 0.3, -s * 0.05, s * 0.2);
    ctx.fillStyle = '#ffffff';
    circle(ctx, -s * 0.05, -s * 0.05, s * 0.07);
    circle(ctx, s * 0.2, -s * 0.2, s * 0.06);
  } else if (id === 'kecap') {
    ctx.fillStyle = '#3e2723';
    roundRect(ctx, -s * 0.3, -s * 0.25, s * 0.6, s * 0.85, s * 0.12);
    ctx.fill();
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-s * 0.14, -s * 0.6, s * 0.28, s * 0.4);
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(-s * 0.18, -s * 0.72, s * 0.36, s * 0.16);
    ctx.fillStyle = '#f2c94c';
    ctx.font = `bold ${Math.round(size * 0.22)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', 0, s * 0.2);
  }
  ctx.restore();
}

/** The renderer: one canvas, one draw per frame. */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  /** Fit the 1280x720 kitchen into the window. */
  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    const ox = (canvas.width - FIELD.width * scale) / 2;
    const oy = (canvas.height - FIELD.height * scale) / 2;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
    return scale;
  }

  /** The wall, floor and header behind everything. */
  function drawRoom(state, screen) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.wallDark;
    for (let x = 0; x < FIELD.width; x += 160) {
      ctx.fillRect(x, 56, 8, 164);
    }
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 560, FIELD.width, 160);
    ctx.fillStyle = PALETTE.floorLine;
    for (let y = 580; y < 720; y += 46) ctx.fillRect(0, y, FIELD.width, 4);
    // Header bar.
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, FIELD.width, LAYOUT.header.h);
    ctx.fillStyle = PALETTE.headerText;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `900 30px ${FONT}`;
    ctx.fillText('DAPUR KILAT', 24, 30);
    ctx.font = `600 15px ${FONT}`;
    ctx.fillStyle = '#ffd54f';
    ctx.fillText('masak cepat, sajikan tepat', 232, 31);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.headerText;
    ctx.font = `800 26px ${FONT}`;
    ctx.fillText(`SKOR ${state.score}`, 640, 24);
    if (state.combo > 1) {
      ctx.fillStyle = '#ffd54f';
      ctx.font = `800 18px ${FONT}`;
      ctx.fillText(`KOMBO x${state.combo}`, 640, 46);
    }
    ctx.textAlign = 'right';
    ctx.font = `800 20px ${FONT}`;
    ctx.fillStyle = PALETTE.headerText;
    ctx.fillText(`LEVEL ${state.level}`, 1080, 30);
    // Strikes: three little pans, crossed out as they are spent.
    for (let i = 0; i < 3; i += 1) {
      const x = 1120 + i * 52;
      ctx.fillStyle = i < state.strikes ? '#c62828' : '#ffd54f';
      circle(ctx, x, 28, 15);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(x + 12, 24, 18, 6);
      if (i < state.strikes) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 8, 20);
        ctx.lineTo(x + 8, 36);
        ctx.moveTo(x + 8, 20);
        ctx.lineTo(x - 8, 36);
        ctx.stroke();
      }
    }
  }

  /** One order ticket on the board. */
  function drawTicket(order, x, selected) {
    const { y, w, h } = LAYOUT.tickets;
    ctx.save();
    if (selected) {
      ctx.shadowColor = PALETTE.ticketSelected;
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = PALETTE.ticket;
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = selected ? PALETTE.ticketSelected : PALETTE.ticketEdge;
    ctx.lineWidth = selected ? 4 : 2;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();
    const dish = dishById(order.dish);
    ctx.fillStyle = PALETTE.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 22px ${FONT}`;
    ctx.fillText(dish.name, x + 16, y + 32);
    // Ingredient chips: filled with a tick once added.
    let chipX = x + 16;
    for (const need of order.needs) {
      const g = ingredientById(need);
      const done = order.added.includes(need);
      ctx.fillStyle = done ? '#c8e6c9' : '#efebe9';
      circle(ctx, chipX + 16, y + 62, 16);
      ctx.strokeStyle = done ? '#2e7d32' : '#bcaaa4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(chipX + 16, y + 62, 16, 0, Math.PI * 2);
      ctx.stroke();
      drawIngredientIcon(ctx, need, chipX + 16, y + 62, 22);
      if (done) {
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(chipX + 8, y + 62);
        ctx.lineTo(chipX + 14, y + 68);
        ctx.lineTo(chipX + 25, y + 54);
        ctx.stroke();
      }
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `600 12px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(g.name, chipX + 16, y + 92);
      chipX += 62;
    }
    // Countdown bar and seconds.
    const frac = Math.max(0, order.timeLeft / order.total);
    const barW = w - 32;
    ctx.fillStyle = '#e0d6c2';
    roundRect(ctx, x + 16, y + h - 26, barW, 12, 6);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? PALETTE.good : frac > 0.25 ? PALETTE.warn : PALETTE.bad;
    if (frac > 0) {
      roundRect(ctx, x + 16, y + h - 26, Math.max(12, barW * frac), 12, 6);
      ctx.fill();
    }
    ctx.fillStyle = frac > 0.25 ? PALETTE.text : PALETTE.bad;
    ctx.font = `800 15px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(order.timeLeft)} dtk`, x + w - 16, y + h - 34);
    ctx.restore();
  }

  /** The order board: three ticket slots, empty ones say so. */
  function drawBoard(state) {
    ctx.fillStyle = PALETTE.board;
    roundRect(ctx, 12, 56, FIELD.width - 24, 148, 14);
    ctx.fill();
    ctx.strokeStyle = PALETTE.boardEdge;
    ctx.lineWidth = 3;
    roundRect(ctx, 12, 56, FIELD.width - 24, 148, 14);
    ctx.stroke();
    for (let i = 0; i < 3; i += 1) {
      const order = state.orders[i];
      const x = LAYOUT.tickets.xs[i];
      if (order) {
        drawTicket(order, x, state.selected === order.id || (state.selected === null && i === 0));
      } else {
        ctx.fillStyle = '#efe3c8';
        roundRect(ctx, x, LAYOUT.tickets.y, LAYOUT.tickets.w, LAYOUT.tickets.h, 12);
        ctx.fill();
        ctx.fillStyle = PALETTE.muted;
        ctx.font = `700 18px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('— menunggu pesanan —', x + LAYOUT.tickets.w / 2, LAYOUT.tickets.y + 70);
      }
    }
  }

  /** The plate being assembled, with its ingredients laid on it. */
  function drawPlate(state) {
    const { cx, cy, r } = LAYOUT.plate;
    ctx.fillStyle = PALETTE.plate;
    circle(ctx, cx, cy, r);
    ctx.strokeStyle = PALETTE.plateEdge;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
    ctx.stroke();
    const order = state.orders.find((o) => o.id === state.selected) ?? state.orders[0];
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(order ? dishById(order.dish).name : 'Piring saji', cx, LAYOUT.plateLabel.y + 20);
    if (order) {
      const spots = [
        [cx - 42, cy - 30],
        [cx + 42, cy - 30],
        [cx - 42, cy + 38],
        [cx + 42, cy + 38],
      ];
      order.added.forEach((id, i) => {
        if (i < spots.length) drawIngredientIcon(ctx, id, spots[i][0], spots[i][1], 64);
      });
      if (order.added.length === 0) {
        ctx.fillStyle = PALETTE.muted;
        ctx.font = `600 16px ${FONT}`;
        ctx.fillText('klik bahan di meja', cx, cy + 6);
      }
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `600 15px ${FONT}`;
    ctx.fillText('PIRING SAJI', cx, cy + r + 26);
  }

  /** The counter's ingredient tiles. */
  function drawTiles(state) {
    ctx.fillStyle = PALETTE.counterTop;
    roundRect(ctx, LAYOUT.tiles.x - 16, LAYOUT.tiles.y - 16, 440, 232, 14);
    ctx.fill();
    ctx.fillStyle = PALETTE.counter;
    roundRect(ctx, LAYOUT.tiles.x - 16, LAYOUT.tiles.y + 200, 440, 16, 8);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.font = `800 15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('MEJA BAHAN — klik untuk menambahkan', LAYOUT.tiles.x - 8, LAYOUT.tiles.y - 10);
    INGREDIENTS.forEach((g, i) => {
      const col = i % LAYOUT.tiles.cols;
      const row = Math.floor(i / LAYOUT.tiles.cols);
      const x = LAYOUT.tiles.x + col * (LAYOUT.tiles.w + LAYOUT.tiles.gap);
      const y = LAYOUT.tiles.y + row * (LAYOUT.tiles.h + LAYOUT.tiles.gap);
      const order = state.orders.find((o) => o.id === state.selected) ?? state.orders[0];
      const needed = order !== undefined && order.needs.includes(g.id) && !order.added.includes(g.id);
      ctx.fillStyle = needed ? PALETTE.tileHot : PALETTE.tile;
      roundRect(ctx, x, y, LAYOUT.tiles.w, LAYOUT.tiles.h, 12);
      ctx.fill();
      ctx.strokeStyle = needed ? '#ff8f00' : PALETTE.tileEdge;
      ctx.lineWidth = needed ? 4 : 2;
      roundRect(ctx, x, y, LAYOUT.tiles.w, LAYOUT.tiles.h, 12);
      ctx.stroke();
      drawIngredientIcon(ctx, g.id, x + LAYOUT.tiles.w / 2, y + 38, 52);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `700 15px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(g.name, x + LAYOUT.tiles.w / 2, y + 82);
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `700 12px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(g.key, x + 8, y + 16);
    });
  }

  /** The stove with its burners and cooking dishes. */
  function drawStove(state) {
    const { x, y, w, h } = LAYOUT.stove;
    ctx.fillStyle = PALETTE.stoveTop;
    roundRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = PALETTE.stove;
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 14);
    ctx.stroke();
    ctx.fillStyle = '#eceff1';
    ctx.font = `800 15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('KOMPOR', x + 16, y + 22);
    if (state.queue.length > 0) {
      ctx.fillStyle = '#ffd54f';
      ctx.textAlign = 'right';
      ctx.fillText(`Antre: ${state.queue.length}`, x + w - 16, y + 22);
    }
    LAYOUT.burners.forEach((b, i) => {
      const slot = state.stove[i];
      ctx.fillStyle = PALETTE.burner;
      circle(ctx, b.cx, b.cy, b.r);
      ctx.strokeStyle = '#607d8b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
      ctx.stroke();
      if (slot !== null) {
        const frac = Math.min(1, slot.t / slot.duration);
        ctx.fillStyle = PALETTE.flame;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, b.r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.lineTo(b.cx, b.cy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#37474f';
        circle(ctx, b.cx, b.cy, b.r - 16);
        ctx.fillStyle = '#eceff1';
        circle(ctx, b.cx, b.cy - 6, b.r - 26);
        ctx.fillStyle = '#eceff1';
        ctx.font = `800 15px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(dishById(slot.dish).name.split(' ')[0], b.cx, b.cy + b.r + 22);
        ctx.fillStyle = '#ffd54f';
        ctx.font = `800 18px ${FONT}`;
        ctx.fillText(`${Math.max(0, slot.duration - slot.t).toFixed(1)}`, b.cx, b.cy + 6);
      } else {
        ctx.fillStyle = '#90a4ae';
        ctx.font = `700 15px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('kosong', b.cx, b.cy + 6);
      }
    });
    ctx.fillStyle = '#b0bec5';
    ctx.font = `600 14px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('masakan matang sendiri — ambil saat berbunyi', x + w / 2, y + h - 16);
  }

  /** The pass: ready plates waiting to be served. */
  function drawPass(state) {
    const { x, y, w, h } = LAYOUT.pass;
    ctx.fillStyle = PALETTE.passTop;
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.font = `800 15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('TEMPAT SAJI', x + 16, y + 22);
    if (state.ready.length === 0) {
      ctx.fillStyle = '#bcaaa4';
      ctx.font = `700 16px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('belum ada hidangan siap', x + w / 2, y + 56);
      return;
    }
    state.ready.forEach((plate, i) => {
      const cx = x + 260 + i * (LAYOUT.passCard.w + 16);
      const cy = y + 12;
      const pulse = 0.6 + 0.4 * Math.sin(state.time * 6);
      ctx.save();
      ctx.shadowColor = '#ffd54f';
      ctx.shadowBlur = 14 * pulse;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, cx, cy, LAYOUT.passCard.w, LAYOUT.passCard.h, 10);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = '#ff8f00';
      ctx.lineWidth = 3;
      roundRect(ctx, cx, cy, LAYOUT.passCard.w, LAYOUT.passCard.h, 10);
      ctx.stroke();
      drawIngredientIcon(ctx, dishById(plate.dish).needs[0], cx + 32, cy + 32, 40);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `800 16px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(dishById(plate.dish).name, cx + 58, cy + 26);
      ctx.fillStyle = plate.timeLeft < 3 ? PALETTE.bad : PALETTE.good;
      ctx.font = `800 15px ${FONT}`;
      ctx.fillText(`SAJIKAN! ${Math.ceil(plate.timeLeft)} dtk`, cx + 58, cy + 48);
    });
  }

  /** Footer hints. */
  function drawFooter() {
    ctx.fillStyle = '#ffe0b2';
    ctx.font = `600 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Klik bahan di meja  •  1–8 pilih bahan  •  Spasi sajikan  •  P jeda  •  M suara', 640, 690);
  }

  /** Crumbs and floating score labels. */
  function drawEffects(state) {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.colour;
      circle(ctx, p.x, p.y, p.size);
    }
    ctx.globalAlpha = 1;
    for (const f of state.floats) {
      ctx.globalAlpha = Math.max(0, 1 - f.age / f.life);
      ctx.fillStyle = f.colour;
      ctx.font = `900 28px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    if (state.messageTime > 0) {
      ctx.fillStyle = 'rgba(62,39,35,0.85)';
      ctx.font = `800 20px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(state.message, 640, 540);
    }
  }

  /** A dark overlay with a centred panel. */
  function overlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(38,24,12,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, 340, 150, 600, 410, 18);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    roundRect(ctx, 340, 150, 600, 410, 18);
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `900 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, 640, 228);
    ctx.font = `600 19px ${FONT}`;
    let y = 282;
    for (const line of lines) {
      ctx.fillText(line, 640, y);
      y += 30;
    }
  }

  return {
    /** Paint the whole kitchen for `screen` at this state. */
    draw(state, screen, best) {
      fit();
      ctx.save();
      if (state.shake > 0) {
        ctx.translate((Math.random() - 0.5) * 10 * state.shake * 4, (Math.random() - 0.5) * 10 * state.shake * 4);
      }
      drawRoom(state, screen);
      drawBoard(state);
      drawPlate(state);
      drawTiles(state);
      drawStove(state);
      drawPass(state);
      drawFooter();
      drawEffects(state);
      if (state.flash > 0) {
        ctx.globalAlpha = state.flash * 0.9;
        ctx.fillStyle = state.flashColour;
        ctx.fillRect(0, 0, FIELD.width, FIELD.height);
        ctx.globalAlpha = 1;
      }
      if (screen === SCREEN_TITLE) {
        overlay('DAPUR KILAT', [
          'Masak cepat, sajikan tepat!',
          '',
          'Klik bahan di meja untuk merakit pesanan,',
          'biarkan matang di kompor, lalu sajikan',
          'sebelum timer pesanan habis.',
          '',
          `Skor terbaik: ${best}`,
          '',
          'Klik atau tekan Spasi untuk mulai',
        ], '#ff8f00');
      } else if (screen === SCREEN_PAUSED) {
        overlay('JEDA', ['Istirahat sebentar.', '', 'Tekan P untuk lanjut masak.'], '#607d8b');
      } else if (screen === SCREEN_OVER) {
        overlay('DAPUR TUTUP!', [
          `Skor: ${state.score}   (terbaik ${Math.max(best, state.score)})`,
          `Hidangan disajikan: ${state.served}`,
          `Kombo terbaik: x${state.bestCombo}   •   Level ${state.level}`,
          '',
          'Tiga pesanan hangus — pelanggan pulang.',
          '',
          'Spasi untuk main lagi',
        ], '#c62828');
      }
      ctx.restore();
    },
  };
}
