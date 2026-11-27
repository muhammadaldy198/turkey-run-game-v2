// The HUD: everything the judge needs to read the run at a glance — score,
// corn, distance, feathers, the dinner bell, the gap to the farmer, the stage
// objective. v2 adds the gap meter (the farmer is a distance behind the
// turkey, not a cone on the floor) and the gate prompt banner (the choice is
// a move: jump the beam or slide under it).
import { BELL_SECONDS, FARMER_GAP_MAX, FEATHERS } from './config.js';

function pill(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function drawHud(ctx, state, t) {
  // Top bar.
  ctx.fillStyle = 'rgba(20, 16, 10, 0.82)';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${state.score}`, 18, 27);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#f5efe0';
  ctx.fillText(`CORN ${state.corn}  ·  DIST ${Math.floor(state.dist)}m  ·  BONUS ${state.bonus}`, 18, 50);

  // Feathers (lives) as drawn tail feathers — left of centre, clear of the
  // stage/objective block, so the objective text never runs under them.
  for (let i = 0; i < FEATHERS; i += 1) {
    const x = 380 + i * 34;
    const y = 32;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i % 2 === 0 ? -0.35 : 0.35);
    ctx.fillStyle = i < state.feathers ? '#ffd94d' : 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#f5efe0';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FEATHERS', 414, 58);

  // Dinner bell: the clock that ends the run. Red + pulsing under 20 seconds.
  const panic = state.timeLeft <= 20;
  const bellColor = panic ? '#ff5a3c' : '#ffd94d';
  ctx.fillStyle = bellColor;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`🔔 ${fmtTime(state.timeLeft)}`, 1262, 30);
  if (panic && Math.sin(t * 8) > 0) {
    ctx.fillStyle = '#ff5a3c';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('BELL SOON — FARMER 2× FAST', 1262, 50);
  } else {
    ctx.fillStyle = '#f5efe0';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('DINNER BELL', 1262, 50);
  }

  // Stage + objective.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8fd0ff';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`STAGE ${state.zone + 1}/3 — ${state.track.zones[state.zone].name}`, 830, 26);
  ctx.fillStyle = '#f5efe0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(state.objective, 830, 48);

  // The gap to the farmer, left under the top bar: a bar that empties as he
  // closes in, and the metres behind the turkey.
  const gapM = Math.max(0, Math.floor(state.farmer.gap / 16));
  const gw = 300;
  const gx = 18;
  const gy = 70;
  pill(ctx, gx - 2, gy - 2, gw + 4, 16, 'rgba(20,16,10,0.7)');
  const gapFrac = Math.min(1, state.farmer.gap / FARMER_GAP_MAX);
  ctx.fillStyle = gapFrac < 0.25 ? '#ff5a3c' : gapFrac < 0.55 ? '#ff9a3c' : '#7dc24a';
  ctx.beginPath();
  ctx.roundRect(gx, gy, Math.max(4, gw * gapFrac), 12, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`FARMER ${gapM}m BEHIND${state.farmer.state === 'FLEE' ? ' — SCARED OFF!' : ''}`, gx + gw + 10, gy + 11);

  // WIN / LOSE, written on the frame: the bell decides which.
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText('ESCAPE OR DINNER', 640, 82);
  const w = 190;
  const x0 = 640 - w / 2;
  pill(ctx, x0, 88, w, 8, 'rgba(20,16,10,0.7)');
  const progress = Math.min(1, state.timeLeft / BELL_SECONDS);
  ctx.fillStyle = '#7dc24a';
  ctx.beginPath();
  ctx.roundRect(x0, 88, w * progress, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#f5efe0';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('ESCAPE', x0 - 8, 96);
  ctx.textAlign = 'left';
  ctx.fillText('DINNER', x0 + w + 8, 96);
}

// The gate prompt: a banner under the top bar while a gate is near. The
// choice is a move, so the banner names the moves, not a menu.
export function drawGatePrompt(ctx, gate) {
  const { def } = gate;
  const y = 112;
  ctx.fillStyle = 'rgba(20,16,10,0.88)';
  ctx.beginPath();
  ctx.roundRect(340, y, 600, 54, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText(`GATE ${gate.index + 1} — ${def.name}`, 640, y + 22);
  ctx.fillStyle = '#fff';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(`[1] ${def.upper.name}   ·   [2] ${def.lower.name}`, 640, y + 44);
}

// "!" over the farmer when he is close enough to grab (world space).
export function drawFarmerMark(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y - 96);
  pill(ctx, -14, -18, 28, 28, 'rgba(20,16,10,0.85)');
  ctx.fillStyle = '#ff5a3c';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('!', 0, 4);
  ctx.restore();
}

// "HE'S RIGHT BEHIND YOU!" — on its own dark pill, clear below the
// ESCAPE OR DINNER bar, when the gap drops under 120 px.
export function drawClosingIn(ctx, t) {
  if (Math.sin(t * 6) < -0.2) return;
  ctx.save();
  ctx.translate(640, 196);
  pill(ctx, -190, -26, 380, 44, 'rgba(20,16,10,0.88)');
  ctx.strokeStyle = '#ff5a3c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-190, -26, 380, 44, 12);
  ctx.stroke();
  ctx.fillStyle = '#ff5a3c';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("HE'S RIGHT BEHIND YOU!", 0, 7);
  ctx.restore();
}
