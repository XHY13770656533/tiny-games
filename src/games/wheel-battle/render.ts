import type { WheelBattleState } from './logic';

const laneX = [22, 50, 78];

export function drawBattlefield(
  ctx: CanvasRenderingContext2D,
  state: WheelBattleState,
  width: number,
  height: number,
  nowMs: number,
) {
  const sx = width / 100;
  const sy = height / 100;
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#0b1020');
  sky.addColorStop(1, '#1e1030');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
  for (let index = 0; index < 28; index += 1) {
    const x = ((index * 37 + nowMs * 0.01) % 100) * sx;
    const y = ((index * 53 + nowMs * 0.018) % 100) * sy;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.setLineDash([8, 10]);
  ctx.lineWidth = 2;
  for (const x of laneX) {
    ctx.beginPath();
    ctx.moveTo(x * sx, 4 * sy);
    ctx.lineTo(x * sx, 92 * sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = 'rgba(248, 113, 113, 0.7)';
  ctx.beginPath();
  ctx.moveTo(6 * sx, 92 * sy);
  ctx.lineTo(94 * sx, 92 * sy);
  ctx.stroke();

  if (state.effects.bulkheadMs > 0 && state.effects.bulkheadLane) {
    const x = state.effects.bulkheadLane === 'left' ? 22 : state.effects.bulkheadLane === 'right' ? 78 : 50;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.fillRect((x - 8) * sx, 86 * sy, 16 * sx, 8 * sy);
  }

  if (state.effects.droneMs > 0) {
    drawShip(ctx, 22 * sx, 88 * sy, sx * 3.2, '#2dd4bf', 'triangle');
    drawShip(ctx, 78 * sx, 88 * sy, sx * 3.2, '#2dd4bf', 'triangle');
  }

  for (const enemy of state.enemies) {
    const color = enemy.type === 'elite' ? '#c084fc' : enemy.type === 'gunship' ? '#fb7185' : '#7dd3fc';
    const shape = enemy.type === 'elite' ? 'diamond' : enemy.type === 'gunship' ? 'trap' : 'triangle';
    drawShip(ctx, enemy.position.x * sx, enemy.position.y * sy, sx * (enemy.type === 'elite' ? 5.5 : 4.2), color, shape, true);
    if (enemy.shield > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.strokeRect((enemy.position.x - 4) * sx, (enemy.position.y - 4) * sy, 8 * sx, 8 * sy);
    }
  }

  if (state.boss && state.boss.hp > 0) {
    drawBoss(ctx, state, sx, sy);
  }

  const playerColor = state.effects.aegisMs > 0
    ? 'rgba(56, 189, 248, 0.55)'
    : state.player.iFrameMs > 0
      ? 'rgba(226, 232, 240, 0.45)'
      : state.player.armor > 0
        ? '#facc15'
        : '#e2e8f0';
  drawShip(ctx, 50 * sx, 86 * sy, sx * 5, playerColor, 'triangle');

  if (state.effects.laserMs > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50 * sx, 86 * sy);
    const aim = state.boss && state.player.targetId !== null && state.player.targetId < 0
      ? { x: 50, y: 16 }
      : state.enemies.find((enemy) => enemy.id === state.player.targetId)?.position ?? { x: 50, y: 12 };
    ctx.lineTo(aim.x * sx, aim.y * sy);
    ctx.stroke();
  }

  for (const bullet of state.bullets) {
    ctx.fillStyle = bullet.faction === 'player' ? (bullet.homing ? '#818cf8' : '#f8fafc') : '#fb7185';
    const size = bullet.homing ? 3.2 : 2.4;
    ctx.beginPath();
    ctx.arc(bullet.position.x * sx, bullet.position.y * sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoss(ctx: CanvasRenderingContext2D, state: WheelBattleState, sx: number, sy: number) {
  const boss = state.boss;
  if (!boss) {
    return;
  }

  if (boss.id === 'twin-drones') {
    if (boss.extra.leftHp > 0) {
      drawShip(ctx, boss.extra.leftX * sx, boss.extra.leftY * sy, sx * 7, '#38bdf8', 'diamond');
    }
    if (boss.extra.rightHp > 0) {
      drawShip(ctx, boss.extra.rightX * sx, boss.extra.rightY * sy, sx * 7, '#f97316', 'diamond');
    }
    return;
  }

  const x = (boss.extra.x ?? 50) * sx;
  const y = (boss.extra.y ?? 16) * sy;
  ctx.fillStyle = boss.id === 'crimson-carrier' ? '#ef4444' : '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x + (boss.id === 'crimson-carrier' ? 46 : 28), y + 16);
  ctx.lineTo(x - (boss.id === 'crimson-carrier' ? 46 : 28), y + 16);
  ctx.closePath();
  ctx.fill();
}

function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  shape: 'triangle' | 'trap' | 'diamond',
  invert = false,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (shape === 'diamond') {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
  } else if (shape === 'trap') {
    ctx.moveTo(x - size, y + (invert ? -size * 0.4 : size * 0.4));
    ctx.lineTo(x + size, y + (invert ? -size * 0.4 : size * 0.4));
    ctx.lineTo(x + size * 0.6, y - (invert ? -size : size));
    ctx.lineTo(x - size * 0.6, y - (invert ? -size : size));
  } else {
    const dir = invert ? 1 : -1;
    ctx.moveTo(x, y + dir * size);
    ctx.lineTo(x + size * 0.7, y - dir * size * 0.6);
    ctx.lineTo(x - size * 0.7, y - dir * size * 0.6);
  }
  ctx.closePath();
  ctx.fill();
}
