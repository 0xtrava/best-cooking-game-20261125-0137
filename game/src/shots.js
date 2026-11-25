// The screenshot scenes behind ?shot=start|play|serve|end. Each one stages a fixed
// world state (no play-through, no luck), so the same seed always gives the same
// frame — and the frame is what a real game looks like at that moment.

import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Set `world` to the named scene (start, play, serve or end; any other name is
 * start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    world.stagePlay();
    return { screen: SCREEN_PLAY, best: 180 };
  }
  if (name === 'serve') {
    world.stageServe();
    return { screen: SCREEN_PLAY, best: 340 };
  }
  if (name === 'end') {
    world.stageEnd();
    return { screen: SCREEN_OVER, best: 520 };
  }
  world.stageStart();
  return { screen: SCREEN_TITLE, best: 0 };
}
