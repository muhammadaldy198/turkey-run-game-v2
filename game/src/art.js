// All art is drawn in code — no image files. v2 is a side-view runner, so
// everything is drawn in profile: the turkey runs right with its tail fanned,
// the farmer chases behind with a pitchfork, the oven breathes fire across
// the track, and the carving knife falls blade-down. The dawn woods (the end
// screen) are the one piece kept from the old draft — they were already right.
import { GROUND_Y, H, W } from './config.js';

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

// ---- The turkey, side profile facing right ----
export function drawTurkey(ctx, x, y, r, dir, moving, t, sliding) {
  ctx.save();
  ctx.translate(x, y);
  if (dir < 0) ctx.scale(-1, 1);
  const run = moving ? Math.sin(t * 14) : 0;
  if (sliding) {
    // Low and stretched: body flat, neck forward, tail up.
    ellipse(ctx, 0, -12, 30, 10, '#8a5a2b');
    ellipse(ctx, -26, -16, 14, 6, '#6b4423', -0.5);
    ellipse(ctx, -30, -20, 12, 5, '#a06a35', -0.9);
    circle(ctx, 26, -20, 9, '#a06a35');
    ctx.fillStyle = '#ff9a3c';
    ctx.beginPath();
    ctx.moveTo(33, -22);
    ctx.lineTo(44, -18);
    ctx.lineTo(33, -15);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 28, -23, 1.8, '#1a1a1a');
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-16, 0);
    ctx.moveTo(8, -4);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }
  // Tail feathers fanned behind.
  ellipse(ctx, -24, -30, 16, 7, '#6b4423', -0.7);
  ellipse(ctx, -27, -22, 15, 6, '#a06a35', -0.35);
  ellipse(ctx, -28, -14, 14, 6, '#7a4a22', 0);
  // Body.
  ellipse(ctx, 0, -24, 26, 18, '#8a5a2b');
  ellipse(ctx, -2, -20, 16, 11, '#a06a35');
  // Wing.
  ellipse(ctx, -4, -26, 13, 8, '#6b4423', -0.2);
  // Head + beak + wattle.
  circle(ctx, 22, -44, 10, '#a06a35');
  ctx.fillStyle = '#ff9a3c';
  ctx.beginPath();
  ctx.moveTo(30, -46);
  ctx.lineTo(42, -42);
  ctx.lineTo(30, -38);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 24, -36, 3, '#e33e2b');
  circle(ctx, 25, -47, 2, '#1a1a1a');
  // Legs: pumping when running, tucked when jumping.
  ctx.strokeStyle = '#e8a34c';
  ctx.lineWidth = 3;
  const airborne = y < GROUND_Y - 4;
  ctx.beginPath();
  if (airborne) {
    ctx.moveTo(-6, -8);
    ctx.lineTo(-12, 0);
    ctx.moveTo(6, -8);
    ctx.lineTo(12, 0);
  } else {
    ctx.moveTo(-6, -8);
    ctx.lineTo(-6 + run * 8, 0);
    ctx.moveTo(6, -8);
    ctx.lineTo(6 - run * 8, 0);
  }
  ctx.stroke();
  ctx.restore();
}

// ---- The farmer, side profile running right, pitchfork in hand ----
export function drawFarmer(ctx, x, y, r, dir, t, close) {
  ctx.save();
  ctx.translate(x, y);
  if (dir < 0) ctx.scale(-1, 1);
  const run = Math.sin(t * 12);
  const run2 = Math.sin(t * 12 + Math.PI);
  // Legs (blue overalls), pumping.
  ctx.strokeStyle = '#2e4a7a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-4, -26);
  ctx.lineTo(-4 + run * 14, 0);
  ctx.moveTo(4, -26);
  ctx.lineTo(4 + run2 * 14, 0);
  ctx.stroke();
  // Body (red shirt).
  rect(ctx, -13, -58, 26, 34, '#c0392b');
  // Arm + pitchfork.
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(8, -48);
  ctx.lineTo(30, -78);
  ctx.stroke();
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, -78);
  ctx.lineTo(38, -92);
  ctx.moveTo(26, -76);
  ctx.lineTo(32, -90);
  ctx.moveTo(34, -80);
  ctx.lineTo(42, -94);
  ctx.stroke();
  // Head + straw hat.
  circle(ctx, 4, -66, 10, '#f0c8a0');
  ellipse(ctx, 4, -72, 18, 5, '#d9a441');
  ellipse(ctx, 4, -76, 9, 6, '#c08a2e');
  circle(ctx, 8, -68, 1.8, '#1a1a1a');
  // The closer he is, the redder his face.
  if (close) {
    ctx.fillStyle = 'rgba(255, 60, 40, 0.35)';
    ctx.beginPath();
    ctx.arc(4, -66, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---- Obstacles ----
export function drawHay(ctx, x, y, w, h) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#b07f2e';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 6, y + (h / 4) * i);
    ctx.lineTo(x + w - 6, y + (h / 4) * i);
    ctx.stroke();
  }
}

export function drawFence(ctx, x, y, w, h) {
  ctx.fillStyle = '#7a4a32';
  ctx.fillRect(x, y, 8, h);
  ctx.fillRect(x + w - 8, y, 8, h);
  ctx.fillRect(x, y + 8, w, 8);
  ctx.fillRect(x, y + h / 2, w, 8);
}

export function drawCrate(ctx, x, y, w, h) {
  ctx.fillStyle = '#a06830';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
}

// A low beam hanging at head height: slide under it.
export function drawBeam(ctx, x, y, w, h) {
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#7a4a32';
  ctx.fillRect(x - 4, y - 6, 8, h + 6);
  ctx.fillRect(x + w - 4, y - 6, 8, h + 6);
}

export function drawMud(ctx, x, y, w) {
  ctx.fillStyle = '#6b4a2a';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w / 2, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6a3a';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y - 2, w / 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---- The oven: iron body at the back, flame jet across the track.
// `flame` is 0 (rest), 1 (ignite — a small flicker, the warning) or 2 (burn).
export function drawOven(ctx, x, y, w, h, t, flame, flameX, flameW) {
  // Body.
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.roundRect(x + 14, y + 30, w - 28, h - 60, 8);
  ctx.fill();
  // Fire in the door window: a warm glow across the whole window plus two
  // wide tongues, so the oven reads LIT at a glance, not just switched on.
  ctx.fillStyle = 'rgba(255, 122, 30, 0.30)';
  ctx.fillRect(x + 14, y + 30, w - 28, h - 60);
  const flick = Math.sin(t * 9) * 4;
  ctx.fillStyle = '#ff7a1e';
  ctx.beginPath();
  ctx.moveTo(x + 20, y + h - 34);
  ctx.lineTo(x + 40, y + 44 + flick);
  ctx.lineTo(x + 66, y + h - 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.moveTo(x + 32, y + h - 34);
  ctx.lineTo(x + 48, y + 58 - flick);
  ctx.lineTo(x + 64, y + h - 34);
  ctx.closePath();
  ctx.fill();
  // Chimney.
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x + w - 34, y - 34, 22, 34);
  // Label.
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OVEN — HOT!', x + w / 2, y - 44);
  // The flame jet across the track, rising from the oven's own base.
  if (flame === 1) {
    // Ignite: one small tongue, the warning.
    const base = y + h;
    const fl = Math.sin(t * 11) * 4;
    ctx.fillStyle = '#ff9a3c';
    ctx.beginPath();
    ctx.moveTo(flameX + 10, base);
    ctx.lineTo(flameX + 20 + fl, base - 42);
    ctx.lineTo(flameX + 30, base);
    ctx.closePath();
    ctx.fill();
  } else if (flame === 2) {
    const fh = 90;
    const base = y + h;
    for (let i = 0; i < 3; i += 1) {
      const fx = flameX + (i * flameW) / 3;
      const fl = Math.sin(t * 11 + i * 2) * 6;
      ctx.fillStyle = i === 1 ? '#ffd94d' : '#ff7a1e';
      ctx.beginPath();
      ctx.moveTo(fx, base);
      ctx.lineTo(fx + 8 + fl, base - fh);
      ctx.lineTo(fx + 18, base);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---- The carving knife: warn (hovering, flashing marker), fall, stick ----
export function drawKnife(ctx, k, t) {
  if (k.state === 'warn') {
    const blink = Math.sin(t * 16) > 0;
    // The mark on the ground where it will land.
    if (blink) {
      ctx.fillStyle = 'rgba(255, 60, 40, 0.55)';
      ctx.beginPath();
      ctx.ellipse(k.x, GROUND_Y + 4, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff5a3c';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('! KNIFE !', k.x, GROUND_Y - 66);
    }
    // The blade, hovering at the top.
    drawBlade(ctx, k.x, 96 + Math.sin(t * 6) * 6);
    return;
  }
  drawBlade(ctx, k.x, k.y);
}

function drawBlade(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  // Blade, point down.
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.moveTo(-7, -34);
  ctx.lineTo(7, -34);
  ctx.lineTo(0, 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a97a3';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Handle.
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.roundRect(-6, -52, 12, 20, 5);
  ctx.fill();
  ctx.restore();
}

// ---- Pickups ----
export function drawCorn(ctx, x, y, r, t) {
  const bob = Math.sin(t * 3 + x * 0.05) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(0.5);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7dc24a';
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(-10, 18);
  ctx.lineTo(0, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawGoldenFeather(ctx, x, y, r, t) {
  const bob = Math.sin(t * 4) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(t * 2) * 0.2);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b07f2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 16);
  ctx.stroke();
  ctx.restore();
}

// ---- The gate fork: upper beam to jump, lower tunnel to slide ----
export function drawGate(ctx, x, name, t) {
  // Posts.
  ctx.fillStyle = '#7a4a32';
  ctx.fillRect(x - 8, GROUND_Y - 170, 14, 170);
  ctx.fillRect(x + 120, GROUND_Y - 170, 14, 170);
  // Upper beam (jump it).
  ctx.fillStyle = '#a06830';
  ctx.fillRect(x - 8, GROUND_Y - 96, 142, 26);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('▲ JUMP', x + 63, GROUND_Y - 104);
  // Lower tunnel (slide under it).
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x - 8, GROUND_Y - 40, 142, 12);
  ctx.fillStyle = '#8fd0ff';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('▼ SLIDE', x + 63, GROUND_Y - 48);
  // Name above.
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(name, x + 63, GROUND_Y - 182);
}

// ---- The dawn window at the end of the track ----
export function drawWindow(ctx, x, y, w, h) {
  ctx.fillStyle = '#7a4a32';
  ctx.fillRect(x - 6, y - 10, w + 12, h + 10);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#ff9a3c');
  g.addColorStop(1, '#ffd94d');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.32, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a4a32';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAWN — FREEDOM', x + w / 2, y - 20);
}

// ---- Decor ----
export function drawPumpkin(ctx, x, y, r) {
  ctx.fillStyle = '#e8722a';
  ctx.beginPath();
  ctx.ellipse(x, y - r, r, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b85a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.9);
  ctx.lineTo(x, y - r * 0.1);
  ctx.stroke();
}

export function drawBarrel(ctx, x, y) {
  ctx.fillStyle = '#8a6a3a';
  ctx.beginPath();
  ctx.roundRect(x - 22, y - 52, 44, 52, 8);
  ctx.fill();
  ctx.strokeStyle = '#5a4423';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 36);
  ctx.lineTo(x + 22, y - 36);
  ctx.moveTo(x - 22, y - 18);
  ctx.lineTo(x + 22, y - 18);
  ctx.stroke();
}

export function drawHaystack(ctx, x, y) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(x - 46, y);
  ctx.lineTo(x, y - 64);
  ctx.lineTo(x + 46, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b07f2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 24, y - 30);
  ctx.lineTo(x + 24, y - 30);
  ctx.stroke();
}

// ---- The dawn woods: the end screen backdrop (kept — it was already right) ----
export function drawDawnWoods(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b2340');
  g.addColorStop(0.35, '#7a4a6b');
  g.addColorStop(0.6, '#ff9a3c');
  g.addColorStop(0.78, '#ffd94d');
  g.addColorStop(1, '#3f5a2e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Sun + rays.
  const sunX = W * 0.68;
  const sunY = H * 0.52;
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffd94d';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2 + t * 0.05;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(a - 0.06) * 260, sunY + Math.sin(a - 0.06) * 260);
    ctx.lineTo(sunX + Math.cos(a + 0.06) * 260, sunY + Math.sin(a + 0.06) * 260);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  circle(ctx, sunX, sunY, 52, '#fff3c4');
  circle(ctx, sunX, sunY, 40, '#ffe98a');
  // Tree layers, far to near.
  drawTreeLine(ctx, H * 0.62, 150, '#3a2f5e', 0.5);
  drawTreeLine(ctx, H * 0.7, 110, '#2a2140', 0.75);
  drawTreeLine(ctx, H * 0.8, 80, '#1a1426', 1);
  // Mist.
  ctx.fillStyle = 'rgba(255, 220, 160, 0.14)';
  ctx.fillRect(0, H * 0.62, W, 60);
  ctx.fillStyle = 'rgba(255, 220, 160, 0.1)';
  ctx.fillRect(0, H * 0.74, W, 50);
  // Grass foreground.
  ctx.fillStyle = '#2e4a22';
  ctx.fillRect(0, H * 0.86, W, H * 0.14);
  ctx.fillStyle = '#3f6a2e';
  for (let x = 0; x < W; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 5, H - 26 - ((x * 7) % 13));
    ctx.lineTo(x + 10, H);
    ctx.closePath();
    ctx.fill();
  }
  // The turkey, free, in the clearing — left of the stats panel and the
  // "run again" pill, so neither ever covers it.
  drawTurkey(ctx, W * 0.18, H * 0.82, 46, 1, false, t, false);
}

function drawTreeLine(ctx, baseY, h, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let x = -20; x < W + 40; x += 46) {
    const th = h * (0.7 + ((x * 13) % 10) / 25);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + 23, baseY - th);
    ctx.lineTo(x + 46, baseY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
