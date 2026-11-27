// The renderer: side view. The camera follows the turkey with the turkey
// fixed at screen x = 360, so the farmer (behind) and the track ahead are
// both in frame. The HUD is always drawn in screen space, never scrolled.
import { GROUND_Y, H, TURKEY_X_SCREEN, W } from './config.js';
import {
  drawBarrel, drawBeam, drawCorn, drawCrate, drawDawnWoods, drawFarmer,
  drawFence, drawGate, drawGoldenFeather, drawHay, drawHaystack, drawKnife,
  drawMud, drawOven, drawPumpkin, drawTurkey, drawWindow,
} from './art.js';
import { drawClosingIn, drawFarmerMark, drawGatePrompt, drawHud } from './hud.js';
import { farmerX, gateAhead } from './world.js';
import { gateDefinitions } from './gates.js';
import { OVEN_BURN, OVEN_CYCLE, OVEN_IGNITE } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.scale(dpr, dpr);
  return {
    draw(state, screen, best, t) {
      ctx.clearRect(0, 0, W, H);
      if (screen === SCREEN_TITLE) {
        drawTitleScene(ctx, state, t);
        return;
      }
      if (screen === SCREEN_OVER) {
        drawEndScreen(ctx, state, best, t);
        return;
      }
      drawWorld(ctx, state, t);
      drawHud(ctx, state, t);
      const gate = gateAhead(state);
      if (gate) drawGatePrompt(ctx, gate);
      if (state.farmer.gap < 120 && state.farmer.state === 'CHASE') drawClosingIn(ctx, t);
      if (screen === SCREEN_PAUSED) {
        ctx.fillStyle = 'rgba(10, 8, 6, 0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffd94d';
        ctx.font = 'bold 52px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', W / 2, H / 2 - 10);
        ctx.fillStyle = '#f5efe0';
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText('Press P or SPACE to keep running', W / 2, H / 2 + 30);
      }
    },
  };
}

function drawWorld(ctx, state, t) {
  const zone = state.track.zones[state.zone];
  const camX = Math.max(0, state.turkey.x - TURKEY_X_SCREEN);
  drawSky(ctx, state.zone, camX, t);
  ctx.save();
  ctx.translate(-camX, 0);
  drawGroundRun(ctx, state.zone, camX);
  // Decor.
  for (const d of zone.decor) {
    if (d.kind === 'pumpkin') drawPumpkin(ctx, d.x, d.y, 20);
    else if (d.kind === 'haystack') drawHaystack(ctx, d.x, d.y);
    else if (d.kind === 'barrel') drawBarrel(ctx, d.x, d.y);
    else if (d.kind === 'pot') drawBarrel(ctx, d.x, d.y);
  }
  // The oven (kitchen): body at the back, flame jet across the track.
  // The flame level comes from the oven cycle: ignite (warning) / burn / rest.
  if (state.zone === 2) {
    const ov = state.track.oven;
    const ph = state.ovenT % OVEN_CYCLE;
    const flame = ph < OVEN_IGNITE ? 1 : ph < OVEN_IGNITE + OVEN_BURN ? 2 : 0;
    drawOven(ctx, ov.x, GROUND_Y - ov.h, ov.w, ov.h, t, flame, ov.flameX, ov.flameW);
  }
  // The dawn window at the end of the track.
  drawWindow(ctx, state.track.windowX, GROUND_Y - 170, 92, 170);
  // Gates.
  const defs = gateDefinitions();
  for (let i = 0; i < defs.length; i += 1) {
    drawGate(ctx, defs[i].x, defs[i].name, t);
  }
  // Obstacles.
  for (const o of zone.obstacles) {
    if (o.kind === 'hay') drawHay(ctx, o.x, GROUND_Y - o.h, o.w, o.h);
    else if (o.kind === 'fence') drawFence(ctx, o.x, GROUND_Y - o.h, o.w, o.h);
    else if (o.kind === 'crate') drawCrate(ctx, o.x, GROUND_Y - o.h, o.w, o.h);
    else if (o.kind === 'beam') drawBeam(ctx, o.x, GROUND_Y - 66, o.w, o.h);
    else if (o.kind === 'mud') drawMud(ctx, o.x, GROUND_Y, o.w);
  }
  // Pickups.
  for (const c of zone.corn) if (!c.taken) drawCorn(ctx, c.x, c.y, 13, t);
  const g = zone.golden;
  if (!g.taken) drawGoldenFeather(ctx, g.x, g.y, 13, t);
  // Knives (kitchen).
  for (const k of state.knives) drawKnife(ctx, k, t);
  // Farmer, when he fits on screen (gap < 380), then the turkey.
  const fx = farmerX(state.farmer, state.turkey.x);
  if (state.farmer.gap < 380) {
    drawFarmer(ctx, fx, GROUND_Y, state.farmer.r, 1, t, state.farmer.gap < 120);
    if (state.farmer.gap < 120) drawFarmerMark(ctx, fx, GROUND_Y);
  }
  drawTurkey(ctx, state.turkey.x, state.turkey.y, state.turkey.r, 1, state.turkey.moving, t, state.turkey.sliding);
  ctx.restore();
}

function drawSky(ctx, zone, camX, t) {
  if (zone === 0) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#7ec8e3');
    g.addColorStop(0.6, '#bfe6f2');
    g.addColorStop(1, '#e8f4d8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Sun.
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(1050, 110, 44, 0, Math.PI * 2);
    ctx.fill();
    // Clouds (parallax 0.3).
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const cx0 = -((camX * 0.3) % 420);
    for (let i = 0; i < 4; i += 1) {
      const cx = cx0 + i * 420;
      ctx.beginPath();
      ctx.ellipse(cx + 80, 90 + (i % 2) * 50, 70, 22, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 130, 80 + (i % 2) * 50, 50, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Distant tree line (parallax 0.5).
    ctx.fillStyle = '#4a7a3a';
    const tx0 = -((camX * 0.5) % 180);
    for (let x = tx0 - 40; x < W + 60; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y - 40);
      ctx.lineTo(x + 30, GROUND_Y - 130);
      ctx.lineTo(x + 60, GROUND_Y - 40);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }
  if (zone === 1) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#6b4a2a');
    g.addColorStop(1, '#8a6d3b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Roof beams.
    ctx.fillStyle = '#5a3a22';
    for (let x = -((camX * 0.6) % 260); x < W + 100; x += 260) {
      ctx.fillRect(x, 0, 26, 150);
    }
    // Hanging lanterns (warm light).
    ctx.fillStyle = 'rgba(255, 217, 77, 0.25)';
    const lx0 = -((camX * 0.6) % 520);
    for (let x = lx0 + 120; x < W + 100; x += 520) {
      ctx.beginPath();
      ctx.arc(x, 120, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  // Kitchen: warm wall, tiles, hanging pans.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#c98a5a');
  g.addColorStop(1, '#e8b98a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(120, 70, 40, 0.35)';
  for (let x = -((camX * 0.6) % 200); x < W + 60; x += 200) {
    ctx.fillRect(x, 0, 4, GROUND_Y);
  }
  // A window with the dawn outside (parallax 0.6).
  const wx = 700 - ((camX * 0.6) % 900);
  ctx.fillStyle = '#7a4a32';
  ctx.fillRect(wx, 120, 150, 190);
  const wg = ctx.createLinearGradient(0, 120, 0, 310);
  wg.addColorStop(0, '#ff9a3c');
  wg.addColorStop(1, '#ffd94d');
  ctx.fillStyle = wg;
  ctx.fillRect(wx + 8, 128, 134, 174);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(wx + 75, 180, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawGroundRun(ctx, zone, camX) {
  const x0 = Math.max(0, camX - 100);
  const x1 = camX + W + 100;
  if (zone === 0) {
    ctx.fillStyle = '#5a8a3c';
    ctx.fillRect(x0, GROUND_Y, x1 - x0, H - GROUND_Y);
    ctx.fillStyle = '#7a5a32';
    ctx.fillRect(x0, GROUND_Y, x1 - x0, 26);
    ctx.fillStyle = '#679f47';
    for (let x = x0 - (x0 % 90); x < x1; x += 90) {
      ctx.fillRect(x, GROUND_Y + 40, 26, 4);
    }
    return;
  }
  if (zone === 1) {
    ctx.fillStyle = '#8a6d3b';
    ctx.fillRect(x0, GROUND_Y, x1 - x0, H - GROUND_Y);
    ctx.strokeStyle = 'rgba(90, 58, 32, 0.5)';
    ctx.lineWidth = 3;
    for (let x = x0 - (x0 % 130); x < x1; x += 130) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    return;
  }
  ctx.fillStyle = '#c9a06a';
  ctx.fillRect(x0, GROUND_Y, x1 - x0, H - GROUND_Y);
  ctx.fillStyle = '#b98d54';
  for (let x = x0 - (x0 % 120); x < x1; x += 120) {
    ctx.fillRect(x, GROUND_Y, 60, H - GROUND_Y);
  }
}

function drawTitleScene(ctx, state, t) {
  // The yard at the start, the turkey waiting, the farmer behind him.
  drawSky(ctx, 0, 0, t);
  ctx.save();
  drawGroundRun(ctx, 0, 0);
  const zone0 = state.track.zones[0];
  for (const d of zone0.decor) {
    if (d.kind === 'pumpkin') drawPumpkin(ctx, d.x, d.y, 20);
    else if (d.kind === 'haystack') drawHaystack(ctx, d.x, d.y);
  }
  drawTurkey(ctx, 300, GROUND_Y, 40, 1, false, t, false);
  drawFarmer(ctx, 140, GROUND_Y, 40, 1, t, false);
  ctx.restore();
  ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 92px system-ui, sans-serif';
  ctx.fillText('GOBBLE OR GONE', W / 2, 250);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText('DAWN DASH', W / 2, 306);
  ctx.fillStyle = '#f5efe0';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('3 gates · 3 feathers · 120 seconds · 1 dinner bell', W / 2, 350);
  ctx.fillText('Jump the hay. Slide the beams. Dodge the oven and the knife.', W / 2, 384);
  const blink = Math.sin(t * 4) > -0.4;
  if (blink) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('PRESS SPACE OR CLICK TO RUN', W / 2, 470);
  }
  ctx.fillStyle = '#8fd0ff';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('SPACE / UP jump · DOWN slide · G gobble · 1 / 2 pick a gate · P pause', W / 2, 520);
}

function drawEndScreen(ctx, state, best, t) {
  if (state.escaped) {
    // The dawn woods, drawn for real — the text finally tells the truth.
    drawDawnWoods(ctx, t);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.fillText('ESCAPED!', W / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText('Out the window, into the dawn woods — the sun rises, the turkey lives.', W / 2, 196);
  } else {
    // Caught: the kitchen, dark, the bell still ringing. The oven stands to
    // the left of the stats panel, where it stays visible.
    ctx.fillStyle = '#1a0e06';
    ctx.fillRect(0, 0, W, H);
    drawOven(ctx, 120, 300, 260, 240, t, 2, 250, 50);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5a3c';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.fillText('DINNER TIME', W / 2, 150);
    ctx.fillStyle = '#f5efe0';
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText(state.endReason, W / 2, 196);
  }
  // Stats on a clean dark panel with real margins.
  const lines = state.escaped
    ? [
        ['CORN', `${state.corn} × 10 = ${state.corn * 10}`],
        ['DISTANCE', `${Math.floor(state.dist)}m`],
        ['GATES + GOLDEN', `${state.bonus + state.distBonus}`],
        ['TIME BONUS', `${Math.ceil(state.timeLeft)}s left × 5 = ${state.escapeBonus}`],
        ['TOTAL SCORE', `${state.score}`],
        ['FEATHERS', `${state.feathers} / 3  ·  GOLDEN ${state.golden} / 3`],
        ['BEST', `${Math.max(best, state.score)}`],
      ]
    : [
        ['SCORE', `${state.score}`],
        ['CORN', `${state.corn}`],
        ['DISTANCE', `${Math.floor(state.dist)}m`],
        ['FEATHERS', `${state.feathers} / 3  ·  GOLDEN ${state.golden} / 3`],
        ['BEST', `${Math.max(best, state.score)}`],
      ];
  const panelW = 560;
  const panelH = 52 + lines.length * 34;
  const px = (W - panelW) / 2;
  const py = 240;
  ctx.fillStyle = 'rgba(12, 9, 6, 0.88)';
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 2;
  ctx.stroke();
  lines.forEach(([label, value], i) => {
    const y = py + 34 + i * 34;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8fd0ff';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.fillText(label, px + 28, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = label === 'TOTAL SCORE' ? '#ffd94d' : '#fff';
    ctx.font = (label === 'TOTAL SCORE' ? 'bold 22px' : '19px') + ' system-ui, sans-serif';
    ctx.fillText(value, px + panelW - 28, y);
  });
  // "Run again" on its own dark pill, so it reads over trees and turkey alike.
  const blink = Math.sin(t * 4) > -0.4;
  if (blink) {
    const ty = py + panelH + 52;
    ctx.fillStyle = 'rgba(12, 9, 6, 0.85)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 250, ty - 30, 500, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', W / 2, ty);
  }
}
