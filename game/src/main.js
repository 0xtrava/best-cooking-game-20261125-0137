// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between four screens: title, play, paused
// and game over. All sounds are synthesized with WebAudio — no audio files.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import {
  EVENT_ADDED,
  EVENT_COOKED,
  EVENT_MISS,
  EVENT_OVER,
  EVENT_SERVED,
  EVENT_WRONG,
  createWorld,
} from './world.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

/** The best score this browser has seen. */
function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** A tiny synthesizer: every sound is a few oscillators, nothing is loaded. */
let audio = null;
let muted = false;

function ensureAudio() {
  if (audio === null) {
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      audio = undefined;
    }
  }
  if (audio && audio.state === 'suspended') audio.resume().catch(() => {});
  return audio || null;
}

function tone(freq, dur, type = 'sine', gain = 0.12, when = 0) {
  const ctx = ensureAudio();
  if (ctx === null || muted) return;
  const start = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0, start);
  amp.gain.linearRampToValueAtTime(gain, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** A chop: two quick thumps. */
function soundChop() {
  tone(220, 0.07, 'triangle', 0.16);
  tone(330, 0.06, 'triangle', 0.1, 0.05);
}

/** A cooked dish: a bright two-note ding. */
function soundDing() {
  tone(880, 0.18, 'sine', 0.14);
  tone(1318, 0.26, 'sine', 0.12, 0.12);
}

/** A served order: a little rising jingle. */
function soundServe() {
  tone(523, 0.1, 'triangle', 0.12);
  tone(659, 0.1, 'triangle', 0.12, 0.09);
  tone(784, 0.18, 'triangle', 0.14, 0.18);
}

/** A miss or a wrong ingredient: a low buzz. */
function soundBuzz() {
  tone(140, 0.25, 'sawtooth', 0.1);
}

/** Game over: a falling phrase. */
function soundOver() {
  tone(392, 0.16, 'triangle', 0.12);
  tone(330, 0.16, 'triangle', 0.12, 0.16);
  tone(262, 0.34, 'triangle', 0.12, 0.32);
}

function runShot(name) {
  const scene = stageShot(name, world);
  renderer.draw(world.state, scene.screen, scene.best);
  renderer.draw(world.state, scene.screen, scene.best);
  window.__shotReady = true;
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  const input = createInput(canvas, {
    state: () => world.state,
    onIngredient(id) {
      const events = world.addIngredient(id);
      if (events & EVENT_ADDED) soundChop();
      else if (events & EVENT_WRONG) soundBuzz();
    },
    onSelect(id) {
      world.selectOrder(id);
      tone(660, 0.05, 'sine', 0.06);
    },
    onServe() {
      if (world.serveReady() & EVENT_SERVED) soundServe();
    },
  });

  function startGame() {
    ensureAudio();
    world.startGame();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Bermain. Rakit pesanan dari meja bahan, masak di kompor, sajikan sebelum waktu habis.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    soundOver();
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Dapur tutup. Skor ${world.state.score}. Terbaik ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      muted = !muted;
      announce(muted ? 'Suara mati.' : 'Suara hidup.');
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PLAY) {
        if (world.serveReady() & EVENT_SERVED) soundServe();
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Lanjut masak.');
      }
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        world.pause();
        screen = SCREEN_PAUSED;
        announce('Jeda.');
      } else if (screen === SCREEN_PAUSED) {
        world.resume();
        screen = SCREEN_PLAY;
        announce('Lanjut masak.');
      }
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) return;
    const events = world.step(STEP);
    if (events & EVENT_COOKED) soundDing();
    if (events & EVENT_MISS) soundBuzz();
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting orders burn unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      world.pause();
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Dapur Kilat. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
