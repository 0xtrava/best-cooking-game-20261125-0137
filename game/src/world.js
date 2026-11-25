// Dapur Kilat's rules: orders arrive on the board, the cook assembles a dish from
// the counter's ingredients, it cooks on the stove, and a ready plate is served
// before its order timer runs out. Three missed orders end the run; every five
// serves the kitchen levels up and the orders come faster.

import {
  DISHES,
  INGREDIENTS,
  LAYOUT,
  MAX_ORDERS,
  POINTS,
  STOVE_BURNERS,
  STRIKES_TO_END,
  dishById,
  ingredientById,
  levelFor,
  orderTimeAt,
  spawnTimeAt,
} from './config.js';

/** An order was served. */
export const EVENT_SERVED = 1;
/** An order's timer ran out. */
export const EVENT_MISS = 2;
/** A dish finished cooking and is ready to serve. */
export const EVENT_COOKED = 4;
/** The run ended (three strikes). */
export const EVENT_OVER = 8;
/** A correct ingredient landed on the plate. */
export const EVENT_ADDED = 16;
/** A wrong ingredient was clicked. */
export const EVENT_WRONG = 32;

let nextOrderId = 1;

/** A fresh order for `dish` at `level`. */
function makeOrder(dish, level, timeLeft = null) {
  const total = orderTimeAt(level);
  return {
    id: nextOrderId,
    dish: dish.id,
    needs: dish.needs.slice(),
    added: [],
    timeLeft: timeLeft === null ? total : timeLeft,
    total,
  };
}

/** A fresh run state. */
function freshState() {
  return {
    screen: 'title',
    time: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    strikes: 0,
    level: 1,
    served: 0,
    orders: [],
    selected: null,
    stove: Array.from({ length: STOVE_BURNERS }, () => null),
    queue: [],
    ready: [],
    spawnTimer: 3,
    particles: [],
    floats: [],
    shake: 0,
    flash: 0,
    flashColour: '#ffffff',
    message: '',
    messageTime: 0,
  };
}

/** The world: state plus the rules that move it. */
export function createWorld(random) {
  const state = freshState();

  /** A burst of crumbs at (x, y). */
  function burst(x, y, colour, n = 10) {
    for (let i = 0; i < n; i += 1) {
      const angle = random.next() * Math.PI * 2;
      const speed = 60 + random.next() * 140;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.5 + random.next() * 0.3,
        age: 0,
        colour,
        size: 3 + random.next() * 4,
      });
    }
  }

  /** A floating score label at (x, y). */
  function floatText(x, y, text, colour) {
    state.floats.push({ x, y, text, colour, age: 0, life: 1.1 });
  }

  /** The order with `id`, or null. */
  function orderById(id) {
    return state.orders.find((o) => o.id === id) ?? null;
  }

  /** The selected order, falling back to the oldest order on the board. */
  function selectedOrder() {
    if (state.selected !== null) {
      const found = orderById(state.selected);
      if (found !== null) return found;
    }
    return state.orders.length > 0 ? state.orders[0] : null;
  }

  /** Deal a new order onto the board. */
  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const dish = random.pick(DISHES);
    const order = makeOrder(dish, state.level);
    nextOrderId += 1;
    state.orders.push(order);
    if (state.selected === null) state.selected = order.id;
  }

  /** Move a finished dish onto a free burner, or into the queue. */
  function startCooking(dishId) {
    const dish = dishById(dishId);
    const free = state.stove.findIndex((slot) => slot === null);
    if (free >= 0) {
      state.stove[free] = { dish: dishId, t: 0, duration: dish.cook };
    } else {
      state.queue.push(dishId);
    }
  }

  function api() {
    return {
      state,

      /** Back to the title screen with a fresh kitchen. */
      reset() {
        const keep = state.screen;
        Object.assign(state, freshState());
        state.screen = keep;
      },

      /** Begin a run from the title screen. */
      startGame() {
        Object.assign(state, freshState());
        state.screen = 'play';
        state.spawnTimer = 2;
        spawnOrder();
        spawnOrder();
      },

      /** Pause a running game. */
      pause() {
        if (state.screen === 'play') state.screen = 'paused';
      },

      /** Resume a paused game. */
      resume() {
        if (state.screen === 'paused') state.screen = 'play';
      },

      /** Pick an order ticket to cook for. */
      selectOrder(id) {
        if (orderById(id) !== null) state.selected = id;
      },

      /** Drop an ingredient onto the selected order's plate. */
      addIngredient(id) {
        if (state.screen !== 'play') return 0;
        const order = selectedOrder();
        if (order === null) return 0;
        if (!order.needs.includes(id)) {
          state.shake = 0.25;
          state.combo = 0;
          return EVENT_WRONG;
        }
        if (order.added.includes(id)) return EVENT_WRONG;
        order.added.push(id);
        state.score += POINTS.ingredient;
        const tile = tileCentre(id);
        burst(tile.x, tile.y, ingredientById(id).colour, 8);
        if (order.added.length === order.needs.length) {
          startCooking(order.dish);
          state.orders = state.orders.filter((o) => o.id !== order.id);
          if (state.selected === order.id) state.selected = null;
          state.message = `${dishById(order.dish).name} naik ke kompor!`;
          state.messageTime = 1.6;
        }
        return EVENT_ADDED;
      },

      /** Serve the oldest ready plate. */
      serveReady() {
        if (state.screen !== 'play' || state.ready.length === 0) return 0;
        const plate = state.ready.shift();
        const dish = dishById(plate.dish);
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        const timeBonus = Math.round(plate.timeLeft * 2);
        const gained = dish.points + timeBonus + (state.combo - 1) * POINTS.comboStep;
        state.score += gained;
        state.served += 1;
        const nextLevel = levelFor(state.served);
        if (nextLevel > state.level) {
          state.level = nextLevel;
          state.message = `LEVEL ${nextLevel}! Pesanan makin cepat!`;
          state.messageTime = 2.2;
        }
        floatText(640, 520, `+${gained}`, '#2e7d32');
        burst(640, 580, '#f2c94c', 14);
        return EVENT_SERVED;
      },

      /** Advance the run by `dt` seconds. Returns an event bitmask. */
      step(dt) {
        if (state.screen !== 'play') return 0;
        let events = 0;
        state.time += dt;
        state.shake = Math.max(0, state.shake - dt);
        state.flash = Math.max(0, state.flash - dt);
        state.messageTime = Math.max(0, state.messageTime - dt);

        // New orders arrive on a timer that quickens with the level.
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          spawnOrder();
          state.spawnTimer = spawnTimeAt(state.level);
        }

        // Order timers run down; a spent one is a strike.
        for (let i = state.orders.length - 1; i >= 0; i -= 1) {
          const order = state.orders[i];
          order.timeLeft -= dt;
          if (order.timeLeft <= 0) {
            state.orders.splice(i, 1);
            if (state.selected === order.id) state.selected = null;
            state.strikes += 1;
            state.combo = 0;
            state.flash = 0.4;
            state.flashColour = '#c62828';
            state.message = 'Pesanan hangus! Pelanggan kecewa.';
            state.messageTime = 1.8;
            events |= EVENT_MISS;
            if (state.strikes >= STRIKES_TO_END) {
              state.screen = 'over';
              events |= EVENT_OVER;
              return events;
            }
          }
        }

        // The stove cooks; a finished dish joins the pass.
        for (let i = 0; i < state.stove.length; i += 1) {
          const slot = state.stove[i];
          if (slot === null) continue;
          slot.t += dt;
          if (slot.t >= slot.duration) {
            const dish = dishById(slot.dish);
            const order = state.orders.find((o) => o.dish === slot.dish);
            state.ready.push({ dish: slot.dish, timeLeft: order ? Math.max(4, order.timeLeft) : 8 });
            state.stove[i] = null;
            if (state.queue.length > 0) {
              const queued = state.queue.shift();
              state.stove[i] = { dish: queued, t: 0, duration: dishById(queued).cook };
            }
            events |= EVENT_COOKED;
          }
        }

        // Ready plates wait on the pass; an old one cools off and is lost.
        for (let i = state.ready.length - 1; i >= 0; i -= 1) {
          state.ready[i].timeLeft -= dt;
          if (state.ready[i].timeLeft <= 0) {
            state.ready.splice(i, 1);
            state.combo = 0;
            state.message = 'Hidangan dingin, pelanggan pergi.';
            state.messageTime = 1.6;
          }
        }

        // Crumbs and floating labels fade.
        for (let i = state.particles.length - 1; i >= 0; i -= 1) {
          const p = state.particles[i];
          p.age += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 320 * dt;
          if (p.age >= p.life) state.particles.splice(i, 1);
        }
        for (let i = state.floats.length - 1; i >= 0; i -= 1) {
          const f = state.floats[i];
          f.age += dt;
          f.y -= 40 * dt;
          if (f.age >= f.life) state.floats.splice(i, 1);
        }
        return events;
      },

      /** A fixed scene for the title screenshot: the kitchen, two orders, no play yet. */
      stageStart() {
        Object.assign(state, freshState());
        state.screen = 'title';
        const first = makeOrder(DISHES[0], 1, 24);
        nextOrderId += 1;
        const second = makeOrder(DISHES[1], 1, 18);
        nextOrderId += 1;
        first.added = ['nasi'];
        state.orders = [first, second];
        state.selected = first.id;
        state.score = 0;
      },

      /** A fixed mid-game scene: one dish half built, one on the stove, timers running. */
      stagePlay() {
        Object.assign(state, freshState());
        state.screen = 'play';
        state.score = 180;
        state.combo = 2;
        state.bestCombo = 2;
        state.served = 3;
        state.level = 1;
        const first = makeOrder(DISHES[0], 1, 19);
        nextOrderId += 1;
        first.added = ['nasi', 'telur'];
        const second = makeOrder(DISHES[1], 1, 26);
        nextOrderId += 1;
        state.orders = [first, second];
        state.selected = first.id;
        state.stove[0] = { dish: 'sate', t: 2.0, duration: 3.5 };
        state.message = 'Nasi Goreng Kilat: tambah Bumbu!';
        state.messageTime = 99;
      },

      /** A fixed serve scene: a plate waits on the pass, glowing to be served. */
      stageServe() {
        Object.assign(state, freshState());
        state.screen = 'play';
        state.score = 340;
        state.combo = 3;
        state.bestCombo = 4;
        state.served = 6;
        state.level = 2;
        const first = makeOrder(DISHES[1], 2, 14);
        nextOrderId += 1;
        first.added = ['mie', 'ayam', 'sayur'];
        state.orders = [first];
        state.selected = first.id;
        state.stove[0] = { dish: 'sup', t: 2.8, duration: 3.5 };
        state.ready = [{ dish: 'nasgor', timeLeft: 7 }];
        state.message = 'Siap disajikan! Klik piringnya!';
        state.messageTime = 99;
      },

      /** A fixed end scene: three strikes, the run's totals on the board. */
      stageEnd() {
        Object.assign(state, freshState());
        state.screen = 'over';
        state.score = 520;
        state.combo = 0;
        state.bestCombo = 5;
        state.strikes = 3;
        state.served = 12;
        state.level = 3;
      },
    };
  }

  return api();
}

/** The centre of an ingredient's tile on the counter (for crumb bursts). */
function tileCentre(id) {
  const index = INGREDIENTS.findIndex((g) => g.id === id);
  const col = index % LAYOUT.tiles.cols;
  const row = Math.floor(index / LAYOUT.tiles.cols);
  return {
    x: LAYOUT.tiles.x + col * (LAYOUT.tiles.w + LAYOUT.tiles.gap) + LAYOUT.tiles.w / 2,
    y: LAYOUT.tiles.y + row * (LAYOUT.tiles.h + LAYOUT.tiles.gap) + LAYOUT.tiles.h / 2,
  };
}
