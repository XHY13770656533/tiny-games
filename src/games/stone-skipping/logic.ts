export type StoneShape = 'disk' | 'oval' | 'wedge' | 'shard' | 'pebble';

export type StoneProfile = {
  id: string;
  name: string;
  shape: StoneShape;
  massGrams: number;
  diameterCm: number;
  thicknessCm: number;
  flatness: number;
  roundness: number;
  edgeSharpness: number;
  surfaceRoughness: number;
  balance: number;
  color: string;
};

export type ThrowControls = {
  angleDeg: number;
  power: number;
  spin: number;
};

export type SkipRecord = {
  index: number;
  distanceMeters: number;
  lateralMeters: number;
  speedMps: number;
  angleDeg: number;
  spinRps: number;
  contactQuality: number;
  splashSize: number;
};

export type SkipResult = {
  stone: StoneProfile;
  controls: ThrowControls;
  skips: SkipRecord[];
  totalDistanceMeters: number;
  score: number;
  endingReason: string;
  openingComment: string;
  grade: string;
};

type ShapePreset = {
  shape: StoneShape;
  names: string[];
  colors: string[];
  mass: [number, number];
  diameter: [number, number];
  thickness: [number, number];
  flatness: [number, number];
  roundness: [number, number];
  edgeSharpness: [number, number];
  surfaceRoughness: [number, number];
  balance: [number, number];
};

const shapePresets: ShapePreset[] = [
  {
    shape: 'disk',
    names: ['薄圆片', '湖岸圆饼', '扁平页岩'],
    colors: ['#64748b', '#78716c', '#57534e'],
    mass: [42, 78],
    diameter: [6.8, 9.8],
    thickness: [0.7, 1.25],
    flatness: [0.78, 0.96],
    roundness: [0.72, 0.95],
    edgeSharpness: [0.48, 0.78],
    surfaceRoughness: [0.12, 0.34],
    balance: [0.66, 0.92],
  },
  {
    shape: 'oval',
    names: ['鹅卵石片', '椭圆灰石', '河滩扁卵'],
    colors: ['#6b7280', '#94a3b8', '#71717a'],
    mass: [55, 105],
    diameter: [6.4, 10.5],
    thickness: [0.95, 1.65],
    flatness: [0.62, 0.86],
    roundness: [0.72, 0.96],
    edgeSharpness: [0.28, 0.58],
    surfaceRoughness: [0.18, 0.42],
    balance: [0.58, 0.86],
  },
  {
    shape: 'wedge',
    names: ['楔形薄片', '斜边页岩', '单侧厚石'],
    colors: ['#52525b', '#3f3f46', '#6d5f4d'],
    mass: [62, 118],
    diameter: [6.2, 9.4],
    thickness: [1.05, 2.1],
    flatness: [0.46, 0.76],
    roundness: [0.34, 0.68],
    edgeSharpness: [0.52, 0.9],
    surfaceRoughness: [0.22, 0.54],
    balance: [0.35, 0.68],
  },
  {
    shape: 'shard',
    names: ['三角石片', '锋利碎片', '不规则薄岩'],
    colors: ['#44403c', '#57534e', '#78716c'],
    mass: [35, 82],
    diameter: [5.4, 8.6],
    thickness: [0.65, 1.45],
    flatness: [0.66, 0.9],
    roundness: [0.16, 0.48],
    edgeSharpness: [0.66, 0.98],
    surfaceRoughness: [0.24, 0.58],
    balance: [0.28, 0.64],
  },
  {
    shape: 'pebble',
    names: ['厚鹅卵石', '圆胖石', '沉手小石'],
    colors: ['#7c6f64', '#a8a29e', '#78716c'],
    mass: [92, 168],
    diameter: [5.6, 8.8],
    thickness: [1.75, 3.2],
    flatness: [0.22, 0.48],
    roundness: [0.76, 0.98],
    edgeSharpness: [0.08, 0.34],
    surfaceRoughness: [0.1, 0.3],
    balance: [0.58, 0.88],
  },
];

const waterDensity = 1000;
const gravity = 9.81;

function randomBetween([min, max]: [number, number], random: () => number) {
  return min + (max - min) * random();
}

function randomInt(min: number, max: number, random: () => number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function pickOne<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)] ?? items[0];
}

export function createStoneOptions(count = 4, random = Math.random): StoneProfile[] {
  return Array.from({ length: count }, (_, index) => createStoneProfile(index, random));
}

export function createStoneProfile(index: number, random = Math.random): StoneProfile {
  const preset = pickOne(shapePresets, random);
  const diameterCm = round(randomBetween(preset.diameter, random), 1);
  const thicknessCm = round(randomBetween(preset.thickness, random), 1);
  const massGrams = Math.round(randomBetween(preset.mass, random));

  return {
    id: `${Date.now()}-${index}-${randomInt(1000, 9999, random)}`,
    name: pickOne(preset.names, random),
    shape: preset.shape,
    massGrams,
    diameterCm,
    thicknessCm,
    flatness: round(randomBetween(preset.flatness, random), 2),
    roundness: round(randomBetween(preset.roundness, random), 2),
    edgeSharpness: round(randomBetween(preset.edgeSharpness, random), 2),
    surfaceRoughness: round(randomBetween(preset.surfaceRoughness, random), 2),
    balance: round(randomBetween(preset.balance, random), 2),
    color: pickOne(preset.colors, random),
  };
}

export function getInitialSpeedMps(power: number) {
  return round(7.5 + clamp(power, 0, 100) * 0.215, 2);
}

export function getSpinRps(spin: number) {
  return round(2 + clamp(spin, 0, 100) * 0.46, 1);
}

export function getStoneQuality(stone: StoneProfile) {
  const thinness = clamp(1 - (stone.thicknessCm - 0.45) / 2.85, 0, 1);
  return clamp(
    stone.flatness * 0.32
      + stone.roundness * 0.18
      + stone.edgeSharpness * 0.15
      + stone.balance * 0.22
      + thinness * 0.18
      - stone.surfaceRoughness * 0.12,
    0,
    1,
  );
}

export function getStoneShapeLabel(shape: StoneShape) {
  const labels: Record<StoneShape, string> = {
    disk: '圆饼',
    oval: '椭圆',
    wedge: '楔形',
    shard: '碎片',
    pebble: '厚卵石',
  };

  return labels[shape];
}

export function simulateStoneSkip(
  stone: StoneProfile,
  controls: ThrowControls,
  random = Math.random,
): SkipResult {
  const skips: SkipRecord[] = [];
  const radiusMeters = stone.diameterCm / 200;
  const projectedArea = Math.PI * radiusMeters ** 2;
  const massKg = stone.massGrams / 1000;
  const stoneQuality = getStoneQuality(stone);
  const roughnessLoss = stone.surfaceRoughness * 0.08;
  const asymmetry = 1 - stone.balance;

  let speed = getInitialSpeedMps(controls.power);
  let spin = getSpinRps(controls.spin);
  let angle = clamp(controls.angleDeg, 2, 28);
  let distance = 0;
  let lateral = 0;
  let endingReason = '石头能量耗尽，最后一次弹跳后沉入水中。';

  for (let index = 1; index <= 32; index += 1) {
    const angleRad = (angle * Math.PI) / 180;
    const dynamicPressure = 0.5 * waterDensity * speed ** 2;
    const liftImpulse = (dynamicPressure * projectedArea * stone.flatness * Math.cos(angleRad)) / massKg;
    const optimumAngle = 9.5 + (1 - stone.flatness) * 4.8 + stone.thicknessCm * 0.45;
    const angleTolerance = 9 + stone.roundness * 4 + stone.flatness * 3;
    const angleScore = clamp(1 - Math.abs(angle - optimumAngle) / angleTolerance, 0, 1);
    const shallowPenalty = angle < 4 ? 0.58 + angle * 0.1 : 1;
    const steepPenalty = angle > 21 ? clamp(1 - (angle - 21) * 0.08, 0.24, 1) : 1;
    const spinStability = clamp(
      (1 - Math.exp(-spin / (13 + asymmetry * 18))) * (0.72 + stone.balance * 0.38),
      0,
      1.1,
    );
    const excessSpinPenalty = spin > 44 ? clamp(1 - (spin - 44) * 0.012 * (1 + asymmetry), 0.72, 1) : 1;
    const liftScore = clamp((liftImpulse - 115) / 950, 0, 1.35);
    const contactQuality = clamp(
      (liftScore * 0.35 + angleScore * 0.3 + spinStability * 0.24 + stoneQuality * 0.22)
        * shallowPenalty
        * steepPenalty
        * excessSpinPenalty
        - roughnessLoss
        + (random() - 0.5) * 0.12,
      0,
      1.2,
    );

    const minimumQuality = 0.43 + index * 0.012 + Math.max(0, 11.5 - speed) * 0.035;
    if (contactQuality < minimumQuality || speed < 5.2 || angle > 27) {
      endingReason = getEndingReason(contactQuality, minimumQuality, speed, angle);
      break;
    }

    const verticalSpeed = Math.sin(angleRad) * speed;
    const airtime = clamp((2 * verticalSpeed) / gravity + 0.18 + contactQuality * 0.16, 0.28, 1.9);
    const hopDistance = clamp(
      speed * Math.cos(angleRad) * airtime * (0.72 + contactQuality * 0.3),
      0.8,
      8.6,
    );
    const driftDirection = stone.shape === 'shard' || stone.shape === 'wedge' ? 1 : -1;
    const spinDrift = (spin - 18) * 0.012 * (0.35 + asymmetry);
    const wobbleDrift = (random() - 0.48) * (0.36 + asymmetry * 0.95);

    distance += hopDistance;
    lateral += driftDirection * spinDrift + wobbleDrift;

    skips.push({
      index,
      distanceMeters: round(distance, 2),
      lateralMeters: round(lateral, 2),
      speedMps: round(speed, 2),
      angleDeg: round(angle, 1),
      spinRps: round(spin, 1),
      contactQuality: round(contactQuality, 2),
      splashSize: round(clamp((1.25 - contactQuality) * 0.8 + angle / 36 + stone.thicknessCm / 6, 0.28, 1.6), 2),
    });

    const energyRetention = clamp(
      0.68
        + contactQuality * 0.15
        + stoneQuality * 0.07
        + spinStability * 0.04
        - angle * 0.006
        - roughnessLoss
        + (random() - 0.5) * 0.045,
      0.54,
      0.91,
    );
    const spinRetention = clamp(0.82 + stone.balance * 0.09 - stone.surfaceRoughness * 0.05, 0.74, 0.93);

    speed *= energyRetention;
    spin *= spinRetention;
    angle = clamp(
      angle + (1 - contactQuality) * 2.8 + asymmetry * 0.9 - stone.flatness * 0.55 + (random() - 0.45) * 1.5,
      2,
      30,
    );
  }

  const totalDistanceMeters = skips.at(-1)?.distanceMeters ?? round(Math.max(0.6, speed * 0.22), 2);
  const score = Math.round(totalDistanceMeters * 12 + skips.length * 32 + getStoneQuality(stone) * 80);

  return {
    stone,
    controls,
    skips,
    totalDistanceMeters,
    score,
    endingReason: skips.length === 0 ? '入水角度、速度或石头形状不足以形成第一次升力，石头直接扎进水里。' : endingReason,
    openingComment: getOpeningComment(stone, controls),
    grade: getGrade(score, skips.length, totalDistanceMeters),
  };
}

function getEndingReason(contactQuality: number, minimumQuality: number, speed: number, angle: number) {
  if (speed < 5.2) {
    return '速度衰减到无法托起石头，最后一次水面接触变成滑行。';
  }

  if (angle > 27) {
    return '入水角逐步变陡，水面冲击把石头翻了过去。';
  }

  if (contactQuality + 0.12 < minimumQuality) {
    return '升力冲量不足，石头没有从水面重新弹起。';
  }

  return '石头边缘吃水太深，旋转稳定性不足后沉入湖面。';
}

function getOpeningComment(stone: StoneProfile, controls: ThrowControls) {
  const quality = getStoneQuality(stone);
  const speed = getInitialSpeedMps(controls.power);
  const spin = getSpinRps(controls.spin);

  if (quality > 0.78 && controls.angleDeg <= 13 && speed > 20 && spin > 24) {
    return '出手非常贴水，扁平石片带着稳定自旋切入湖面。';
  }

  if (controls.angleDeg > 19) {
    return '入水角偏陡，第一次接触会损失大量能量。';
  }

  if (spin < 12) {
    return '转速偏低，石头姿态很容易被水面扰动。';
  }

  if (quality < 0.48) {
    return '这块石头不算理想，需要更低角度和更强旋转来弥补形状缺陷。';
  }

  return '石头以较稳定姿态离手，后续表现取决于速度衰减和每次触水角度。';
}

function getGrade(score: number, skips: number, distance: number) {
  if (skips >= 14 || score >= 700 || distance >= 48) {
    return '湖面传说';
  }

  if (skips >= 9 || score >= 480 || distance >= 32) {
    return '熟练水漂手';
  }

  if (skips >= 5 || score >= 300 || distance >= 18) {
    return '稳定连跳';
  }

  if (skips >= 2) {
    return '初见水花';
  }

  return '需要再调参';
}
