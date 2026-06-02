export type SpeciesId = 'rabbit' | 'sheep' | 'deer' | 'fox' | 'lynx' | 'wolf' | 'bear';
export type HabitatId = 'grassland' | 'forest' | 'lake' | 'hill';
export type AnimalState = 'foraging' | 'hunting' | 'fleeing';
export type DeathCause = 'predation' | 'starvation' | 'oldAge';

export type Animal = {
  id: number;
  speciesId: SpeciesId;
  x: number;
  y: number;
  wanderAngle: number;
  ageMs: number;
  hungerMs: number;
  breedChargeMs: number;
  hp: number;
  state: AnimalState;
};

export type AnimalProfile = {
  id: SpeciesId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  maxHp: number;
  size: number;
  speed: number;
  fleeSpeed: number;
  attackDamage: number;
  visionRadius: number;
  fearRadius: number;
  lifespanMs: number;
  hungerLimitMs: number;
  reproductionMs: number;
  maturityMs: number;
  initialCount: number;
  populationLimit: number;
  preySpecies: SpeciesId[];
  predatorSpecies: SpeciesId[];
  foodHabitats: HabitatId[];
  preferredHabitats: Partial<Record<HabitatId, number>>;
};

export type SpeciesCounts = Record<SpeciesId, number>;
export type DeathCounts = Record<DeathCause, number>;

export type EcosystemStatus = 'running' | 'paused';

export type EcosystemState = {
  status: EcosystemStatus;
  elapsedMs: number;
  nextAnimalId: number;
  animals: Animal[];
  births: SpeciesCounts;
  placed: SpeciesCounts;
  deaths: DeathCounts;
  eventLog: string[];
};

type Point = {
  x: number;
  y: number;
};

type HabitatZone = {
  id: HabitatId;
  name: string;
  center: Point;
  radiusX: number;
  radiusY: number;
};

export const meadowWidth = 100;
export const meadowHeight = 68;
export const speciesOrder: SpeciesId[] = ['rabbit', 'sheep', 'deer', 'fox', 'lynx', 'wolf', 'bear'];

export const habitatLabels: Record<HabitatId, string> = {
  grassland: '草地',
  forest: '树林',
  lake: '湖泊',
  hill: '丘陵',
};

export const habitatZones: HabitatZone[] = [
  { id: 'forest', name: '西侧树林', center: { x: 19, y: 18 }, radiusX: 18, radiusY: 14 },
  { id: 'forest', name: '北侧树林', center: { x: 78, y: 17 }, radiusX: 16, radiusY: 12 },
  { id: 'lake', name: '湖泊', center: { x: 72, y: 50 }, radiusX: 16, radiusY: 9 },
  { id: 'hill', name: '丘陵', center: { x: 27, y: 53 }, radiusX: 17, radiusY: 11 },
];

export const animalProfiles: Record<SpeciesId, AnimalProfile> = {
  rabbit: {
    id: 'rabbit',
    name: '野兔',
    shortName: '兔',
    description: '繁殖最快的小型草食动物，喜欢草地和树林边缘，主要躲避狐狸、猞猁与狼。',
    color: '#f8fafc',
    maxHp: 14,
    size: 0.86,
    speed: 8.6,
    fleeSpeed: 15.8,
    attackDamage: 0,
    visionRadius: 20,
    fearRadius: 18,
    lifespanMs: 76000,
    hungerLimitMs: 14000,
    reproductionMs: 5200,
    maturityMs: 6400,
    initialCount: 14,
    populationLimit: 42,
    preySpecies: [],
    predatorSpecies: ['fox', 'lynx', 'wolf'],
    foodHabitats: ['grassland', 'forest'],
    preferredHabitats: { grassland: 1, forest: 0.72, hill: 0.32 },
  },
  sheep: {
    id: 'sheep',
    name: '绵羊',
    shortName: '羊',
    description: '稳定的草食动物，体型中等，喜欢开阔草地和丘陵，会被狐狸、猞猁、狼和棕熊捕食。',
    color: '#e2e8f0',
    maxHp: 28,
    size: 1.12,
    speed: 5.5,
    fleeSpeed: 10.5,
    attackDamage: 0,
    visionRadius: 22,
    fearRadius: 20,
    lifespanMs: 104000,
    hungerLimitMs: 19000,
    reproductionMs: 8600,
    maturityMs: 9800,
    initialCount: 10,
    populationLimit: 34,
    preySpecies: [],
    predatorSpecies: ['fox', 'lynx', 'wolf', 'bear'],
    foodHabitats: ['grassland', 'hill'],
    preferredHabitats: { grassland: 1, hill: 0.78, lake: 0.22 },
  },
  deer: {
    id: 'deer',
    name: '梅花鹿',
    shortName: '鹿',
    description: '生命值较高的草食动物，偏爱树林和湖边，繁殖慢，主要天敌是狼和棕熊。',
    color: '#b45309',
    maxHp: 42,
    size: 1.34,
    speed: 7.1,
    fleeSpeed: 13.2,
    attackDamage: 0,
    visionRadius: 24,
    fearRadius: 22,
    lifespanMs: 122000,
    hungerLimitMs: 22000,
    reproductionMs: 13000,
    maturityMs: 15000,
    initialCount: 6,
    populationLimit: 22,
    preySpecies: [],
    predatorSpecies: ['wolf', 'bear'],
    foodHabitats: ['forest', 'lake'],
    preferredHabitats: { forest: 1, lake: 0.72, grassland: 0.42 },
  },
  fox: {
    id: 'fox',
    name: '狐狸',
    shortName: '狐',
    description: '中型捕食者，擅长追捕野兔和落单绵羊，也会躲避猞猁、狼和棕熊，喜欢树林。',
    color: '#f97316',
    maxHp: 32,
    size: 1.05,
    speed: 8.2,
    fleeSpeed: 13.5,
    attackDamage: 13,
    visionRadius: 27,
    fearRadius: 18,
    lifespanMs: 98000,
    hungerLimitMs: 17500,
    reproductionMs: 11200,
    maturityMs: 12500,
    initialCount: 3,
    populationLimit: 16,
    preySpecies: ['rabbit', 'sheep'],
    predatorSpecies: ['lynx', 'wolf', 'bear'],
    foodHabitats: [],
    preferredHabitats: { forest: 1, grassland: 0.52, hill: 0.34 },
  },
  lynx: {
    id: 'lynx',
    name: '猞猁',
    shortName: '猞',
    description: '隐蔽的森林捕食者，会捕食野兔、狐狸和落单绵羊，但也会被狼和棕熊攻击。',
    color: '#a16207',
    maxHp: 40,
    size: 1.22,
    speed: 8.8,
    fleeSpeed: 14.1,
    attackDamage: 15,
    visionRadius: 28,
    fearRadius: 19,
    lifespanMs: 108000,
    hungerLimitMs: 19000,
    reproductionMs: 12800,
    maturityMs: 13800,
    initialCount: 2,
    populationLimit: 11,
    preySpecies: ['rabbit', 'sheep', 'fox'],
    predatorSpecies: ['wolf', 'bear'],
    foodHabitats: [],
    preferredHabitats: { forest: 1, hill: 0.58, grassland: 0.38 },
  },
  wolf: {
    id: 'wolf',
    name: '灰狼',
    shortName: '狼',
    description: '大型捕食者，能猎杀鹿、羊、狐狸、猞猁和兔子，也会避开更强的棕熊。',
    color: '#64748b',
    maxHp: 54,
    size: 1.42,
    speed: 7.8,
    fleeSpeed: 9.2,
    attackDamage: 18,
    visionRadius: 30,
    fearRadius: 0,
    lifespanMs: 118000,
    hungerLimitMs: 21000,
    reproductionMs: 14800,
    maturityMs: 16000,
    initialCount: 2,
    populationLimit: 12,
    preySpecies: ['rabbit', 'sheep', 'deer', 'fox', 'lynx'],
    predatorSpecies: ['bear'],
    foodHabitats: [],
    preferredHabitats: { forest: 0.82, grassland: 0.64, hill: 0.45 },
  },
  bear: {
    id: 'bear',
    name: '棕熊',
    shortName: '熊',
    description: '最高阶的重型捕食者，行动较慢但生命值和攻击力很高，会捕食鹿、羊、狼、猞猁和狐狸。',
    color: '#78350f',
    maxHp: 78,
    size: 1.78,
    speed: 5.6,
    fleeSpeed: 7.4,
    attackDamage: 24,
    visionRadius: 25,
    fearRadius: 0,
    lifespanMs: 136000,
    hungerLimitMs: 26000,
    reproductionMs: 19000,
    maturityMs: 22000,
    initialCount: 1,
    populationLimit: 6,
    preySpecies: ['sheep', 'deer', 'fox', 'lynx', 'wolf'],
    predatorSpecies: [],
    foodHabitats: [],
    preferredHabitats: { forest: 0.86, lake: 0.72, hill: 0.52 },
  },
};

const maxEventLogItems = 8;
const newbornSpread = 4.6;
const oldAgeVarianceMs = 12000;
const starvationDamagePerSecond = 7.5;
const habitatPull = 0.35;
const huntHungerThreshold = 0.25;

export function createInitialState(random: () => number = Math.random): EcosystemState {
  let nextAnimalId = 1;
  const animals: Animal[] = [];

  for (const speciesId of speciesOrder) {
    const profile = animalProfiles[speciesId];

    for (let index = 0; index < profile.initialCount; index += 1) {
      animals.push(createAnimal(nextAnimalId, speciesId, randomHabitatPoint(profile, random), random, true));
      nextAnimalId += 1;
    }
  }

  return {
    status: 'running',
    elapsedMs: 0,
    nextAnimalId,
    animals,
    births: createSpeciesCounts(),
    placed: createSpeciesCounts(),
    deaths: { predation: 0, starvation: 0, oldAge: 0 },
    eventLog: ['生态模拟开始：动物会寻找食物、逃离天敌，并在适合的环境中繁殖。'],
  };
}

export function advanceEcosystem(
  state: EcosystemState,
  deltaMs: number,
  random: () => number = Math.random,
): EcosystemState {
  if (state.status !== 'running') {
    return state;
  }

  const elapsedMs = state.elapsedMs + deltaMs;
  const deltaSeconds = deltaMs / 1000;
  const currentAnimals = state.animals;
  const movedAnimals = currentAnimals.map((animal) => moveAnimal(animal, currentAnimals, deltaMs, deltaSeconds, random));
  const hpById = new Map(movedAnimals.map((animal) => [animal.id, animal.hp]));
  const hungerById = new Map(movedAnimals.map((animal) => [animal.id, animal.hungerMs]));
  const eatenById = new Map<number, SpeciesId>();
  const events: string[] = [];

  for (const predator of movedAnimals) {
    const predatorProfile = animalProfiles[predator.speciesId];

    if (predatorProfile.attackDamage <= 0 || predatorProfile.preySpecies.length === 0) {
      continue;
    }

    const prey = findNearestAnimal(predator, movedAnimals, (candidate) => (
      candidate.id !== predator.id
      && !eatenById.has(candidate.id)
      && predatorProfile.preySpecies.includes(candidate.speciesId)
    ));

    if (!prey) {
      continue;
    }

    const preyProfile = animalProfiles[prey.item.speciesId];
    const catchDistance = (predatorProfile.size + preyProfile.size) * 1.25;

    if (prey.distance > catchDistance) {
      continue;
    }

    const nextHp = (hpById.get(prey.item.id) ?? prey.item.hp) - predatorProfile.attackDamage * deltaSeconds;
    hpById.set(prey.item.id, nextHp);

    if (nextHp <= 0) {
      eatenById.set(prey.item.id, predator.speciesId);
      hungerById.set(predator.id, 0);
      hpById.set(predator.id, Math.min(predatorProfile.maxHp, (hpById.get(predator.id) ?? predator.hp) + predatorProfile.maxHp * 0.24));
    }
  }

  let nextAnimalId = state.nextAnimalId;
  const births = { ...state.births };
  const deaths = { ...state.deaths };
  const survivingAnimals: Animal[] = [];
  const bornAnimals: Animal[] = [];
  const predationSummary = createSpeciesCounts();
  const birthSummary = createSpeciesCounts();

  for (const animal of movedAnimals) {
    const profile = animalProfiles[animal.speciesId];
    const hp = hpById.get(animal.id) ?? animal.hp;
    const hungerMs = hungerById.get(animal.id) ?? animal.hungerMs;
    const eatenBy = eatenById.get(animal.id);

    if (eatenBy) {
      deaths.predation += 1;
      predationSummary[animal.speciesId] += 1;
      continue;
    }

    if (animal.ageMs >= profile.lifespanMs + Math.sin(animal.id) * oldAgeVarianceMs) {
      deaths.oldAge += 1;
      continue;
    }

    if (hp <= 0) {
      deaths.starvation += 1;
      continue;
    }

    const updatedAnimal = {
      ...animal,
      hp,
      hungerMs,
    };

    if (canReproduce(updatedAnimal, movedAnimals) && countSpecies([...survivingAnimals, ...bornAnimals], animal.speciesId) < profile.populationLimit) {
      const child = createAnimal(nextAnimalId, animal.speciesId, nearbyPoint(updatedAnimal, random), random);
      nextAnimalId += 1;
      births[animal.speciesId] += 1;
      birthSummary[animal.speciesId] += 1;
      bornAnimals.push(child);
      survivingAnimals.push({
        ...updatedAnimal,
        breedChargeMs: 0,
      });
      continue;
    }

    survivingAnimals.push(updatedAnimal);
  }

  for (const speciesId of speciesOrder) {
    if (birthSummary[speciesId] > 0) {
      events.push(`${animalProfiles[speciesId].name}繁殖了 ${birthSummary[speciesId]} 只幼崽。`);
    }
  }

  for (const speciesId of speciesOrder) {
    if (predationSummary[speciesId] > 0) {
      events.push(`${predationSummary[speciesId]} 只${animalProfiles[speciesId].name}被捕食。`);
    }
  }

  const starvationDelta = deaths.starvation - state.deaths.starvation;
  const oldAgeDelta = deaths.oldAge - state.deaths.oldAge;

  if (starvationDelta > 0) {
    events.push(`${starvationDelta} 只动物因为饥饿耗尽生命值。`);
  }

  if (oldAgeDelta > 0) {
    events.push(`${oldAgeDelta} 只动物自然老去。`);
  }

  return {
    ...state,
    elapsedMs,
    nextAnimalId,
    animals: [...survivingAnimals, ...bornAnimals],
    births,
    deaths,
    eventLog: addEvents(state.eventLog, elapsedMs, events),
  };
}

export function addAnimalAtRandom(
  state: EcosystemState,
  speciesId: SpeciesId,
  random: () => number = Math.random,
): EcosystemState {
  const profile = animalProfiles[speciesId];

  if (countSpecies(state.animals, speciesId) >= profile.populationLimit) {
    return {
      ...state,
      eventLog: addEvents(state.eventLog, state.elapsedMs, [`${profile.name}数量已接近地图承载上限，暂时无法继续投放。`]),
    };
  }

  const animal = createAnimal(state.nextAnimalId, speciesId, randomLandPoint(random), random);

  return {
    ...state,
    nextAnimalId: state.nextAnimalId + 1,
    animals: [...state.animals, animal],
    placed: {
      ...state.placed,
      [speciesId]: state.placed[speciesId] + 1,
    },
    eventLog: addEvents(state.eventLog, state.elapsedMs, [`玩家随机投放了 1 只${profile.name}。`]),
  };
}

export function setEcosystemStatus(
  state: EcosystemState,
  status: EcosystemStatus,
): EcosystemState {
  if (state.status === status) {
    return state;
  }

  return {
    ...state,
    status,
  };
}

export function getSpeciesCounts(animals: Animal[]): SpeciesCounts {
  const counts = createSpeciesCounts();

  for (const animal of animals) {
    counts[animal.speciesId] += 1;
  }

  return counts;
}

export function getHabitatAt(point: Point): HabitatId {
  for (const zone of habitatZones) {
    if (isInsideEllipse(point, zone)) {
      return zone.id;
    }
  }

  return 'grassland';
}

export function getEcosystemMood(state: EcosystemState) {
  const counts = getSpeciesCounts(state.animals);
  const herbivores = counts.rabbit + counts.sheep + counts.deer;
  const predators = counts.fox + counts.lynx + counts.wolf + counts.bear;

  if (state.animals.length === 0) {
    return '地图已经没有动物，可以通过投放重新建立生态。';
  }

  if (predators === 0) {
    return '捕食者消失，草食动物会快速扩张。';
  }

  if (herbivores === 0) {
    return '草食动物消失，捕食者会因缺少食物而衰退。';
  }

  if (predators > herbivores * 0.45) {
    return '捕食者偏多，草食动物承受明显压力。';
  }

  if (herbivores > predators * 8) {
    return '草食动物偏多，地图承载压力正在上升。';
  }

  return '食物链暂时保持动态平衡。';
}

export function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function moveAnimal(
  animal: Animal,
  animals: Animal[],
  deltaMs: number,
  deltaSeconds: number,
  random: () => number,
): Animal {
  const profile = animalProfiles[animal.speciesId];
  const habitat = getHabitatAt(animal);
  const predator = findNearestAnimal(animal, animals, (candidate) => (
    candidate.id !== animal.id && profile.predatorSpecies.includes(candidate.speciesId)
  ));
  const shouldFlee = Boolean(predator && predator.distance <= profile.fearRadius);
  const prey = profile.preySpecies.length > 0 && animal.hungerMs > profile.hungerLimitMs * huntHungerThreshold
    ? findNearestAnimal(animal, animals, (candidate) => (
      candidate.id !== animal.id && profile.preySpecies.includes(candidate.speciesId)
    ))
    : null;
  const shouldHunt = Boolean(prey && prey.distance <= profile.visionRadius && !shouldFlee);
  const habitatTarget = getHabitatTarget(profile, animal, random);

  let state: AnimalState = 'foraging';
  let angle = blendAngles(animal.wanderAngle, Math.atan2(habitatTarget.y - animal.y, habitatTarget.x - animal.x), habitatPull);
  let speed = profile.speed * getTerrainSpeedMultiplier(habitat, profile);

  if (shouldFlee && predator) {
    state = 'fleeing';
    angle = Math.atan2(animal.y - predator.item.y, animal.x - predator.item.x) + (random() - 0.5) * 0.36;
    speed = profile.fleeSpeed;
  } else if (shouldHunt && prey) {
    state = 'hunting';
    angle = Math.atan2(prey.item.y - animal.y, prey.item.x - animal.x);
    speed = profile.speed * 1.1;
  } else {
    angle += (random() - 0.5) * 0.82 * deltaSeconds;
  }

  const moved = moveWithinBounds(animal, angle, speed * deltaSeconds);
  const hungerMs = updateHunger(animal, profile, habitat, deltaMs);
  const hp = updateHp(animal, profile, hungerMs, habitat, deltaSeconds);
  const breedChargeMs = updateBreedCharge(animal, profile, animals, habitat, deltaMs);

  return {
    ...animal,
    ...moved,
    ageMs: animal.ageMs + deltaMs,
    hungerMs,
    hp,
    breedChargeMs,
    state,
  };
}

function updateHunger(
  animal: Animal,
  profile: AnimalProfile,
  habitat: HabitatId,
  deltaMs: number,
) {
  if (profile.preySpecies.length === 0 && profile.foodHabitats.includes(habitat)) {
    return Math.max(0, animal.hungerMs - deltaMs * 1.45);
  }

  const hungerRate = profile.preySpecies.length > 0 ? 1 : 0.82;
  return Math.min(profile.hungerLimitMs * 1.35, animal.hungerMs + deltaMs * hungerRate);
}

function updateHp(
  animal: Animal,
  profile: AnimalProfile,
  hungerMs: number,
  habitat: HabitatId,
  deltaSeconds: number,
) {
  if (hungerMs >= profile.hungerLimitMs) {
    return animal.hp - starvationDamagePerSecond * deltaSeconds;
  }

  const habitatScore = profile.preferredHabitats[habitat] ?? 0;

  if (hungerMs < profile.hungerLimitMs * 0.35 && habitatScore > 0.65) {
    return Math.min(profile.maxHp, animal.hp + deltaSeconds * 2);
  }

  return animal.hp;
}

function updateBreedCharge(
  animal: Animal,
  profile: AnimalProfile,
  animals: Animal[],
  habitat: HabitatId,
  deltaMs: number,
) {
  const hasNearbyPredator = Boolean(findNearestAnimal(animal, animals, (candidate) => (
    candidate.id !== animal.id
    && profile.predatorSpecies.includes(candidate.speciesId)
    && getDistance(animal, candidate) < profile.fearRadius * 1.15
  )));
  const habitatScore = profile.preferredHabitats[habitat] ?? 0;
  const canCharge = animal.ageMs >= profile.maturityMs
    && animal.hungerMs < profile.hungerLimitMs * 0.55
    && habitatScore >= 0.5
    && !hasNearbyPredator;

  if (canCharge) {
    return Math.min(profile.reproductionMs, animal.breedChargeMs + deltaMs);
  }

  return Math.max(0, animal.breedChargeMs - deltaMs * 0.72);
}

function canReproduce(animal: Animal, animals: Animal[]) {
  const profile = animalProfiles[animal.speciesId];

  if (animal.breedChargeMs < profile.reproductionMs) {
    return false;
  }

  const nearbySameSpecies = findNearestAnimal(animal, animals, (candidate) => (
    candidate.id !== animal.id
    && candidate.speciesId === animal.speciesId
    && candidate.ageMs >= profile.maturityMs
  ));

  return Boolean(nearbySameSpecies && nearbySameSpecies.distance < profile.visionRadius);
}

function createAnimal(
  id: number,
  speciesId: SpeciesId,
  point: Point,
  random: () => number,
  isInitial = false,
): Animal {
  const profile = animalProfiles[speciesId];

  return {
    id,
    speciesId,
    x: point.x,
    y: point.y,
    wanderAngle: randomAngle(random),
    ageMs: isInitial ? random() * profile.maturityMs * 1.4 : 0,
    hungerMs: random() * profile.hungerLimitMs * 0.35,
    breedChargeMs: isInitial ? random() * profile.reproductionMs * 0.45 : 0,
    hp: profile.maxHp,
    state: 'foraging',
  };
}

function createSpeciesCounts(value = 0): SpeciesCounts {
  return {
    rabbit: value,
    sheep: value,
    deer: value,
    fox: value,
    lynx: value,
    wolf: value,
    bear: value,
  };
}

function randomHabitatPoint(profile: AnimalProfile, random: () => number): Point {
  const habitatIds = Object.entries(profile.preferredHabitats)
    .filter(([, weight]) => weight >= 0.65)
    .map(([habitatId]) => habitatId as HabitatId);
  const habitatId = habitatIds[Math.floor(random() * habitatIds.length)] ?? 'grassland';
  const zones = habitatZones.filter((zone) => zone.id === habitatId);

  if (zones.length === 0) {
    return randomLandPoint(random);
  }

  const zone = zones[Math.floor(random() * zones.length)];
  return clampPoint({
    x: zone.center.x + (random() - 0.5) * zone.radiusX * 1.3,
    y: zone.center.y + (random() - 0.5) * zone.radiusY * 1.3,
  });
}

function randomLandPoint(random: () => number): Point {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const point = {
      x: 5 + random() * (meadowWidth - 10),
      y: 5 + random() * (meadowHeight - 10),
    };

    if (getHabitatAt(point) !== 'lake' || random() < 0.18) {
      return point;
    }
  }

  return { x: 50, y: 34 };
}

function nearbyPoint(point: Point, random: () => number): Point {
  return clampPoint({
    x: point.x + (random() - 0.5) * newbornSpread * 2,
    y: point.y + (random() - 0.5) * newbornSpread * 2,
  });
}

function getHabitatTarget(profile: AnimalProfile, animal: Animal, random: () => number): Point {
  const currentHabitat = getHabitatAt(animal);
  const currentScore = profile.preferredHabitats[currentHabitat] ?? 0;

  if (currentScore >= 0.72 && random() > 0.18) {
    return {
      x: animal.x + Math.cos(animal.wanderAngle) * 10,
      y: animal.y + Math.sin(animal.wanderAngle) * 10,
    };
  }

  const preferredEntries = Object.entries(profile.preferredHabitats)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
  const habitatId = (preferredEntries[0]?.[0] as HabitatId | undefined) ?? 'grassland';
  const zones = habitatZones.filter((zone) => zone.id === habitatId);

  if (zones.length === 0) {
    return { x: 50, y: 34 };
  }

  const nearestZone = zones
    .map((zone) => ({ zone, distance: getDistance(animal, zone.center) }))
    .sort((a, b) => a.distance - b.distance)[0]?.zone;

  return nearestZone?.center ?? { x: 50, y: 34 };
}

function moveWithinBounds(
  animal: Pick<Animal, 'x' | 'y' | 'wanderAngle'>,
  angle: number,
  distance: number,
) {
  let x = animal.x + Math.cos(angle) * distance;
  let y = animal.y + Math.sin(angle) * distance;
  let wanderAngle = angle;

  if (x < 2 || x > meadowWidth - 2) {
    x = clamp(x, 2, meadowWidth - 2);
    wanderAngle = Math.PI - wanderAngle;
  }

  if (y < 2 || y > meadowHeight - 2) {
    y = clamp(y, 2, meadowHeight - 2);
    wanderAngle = -wanderAngle;
  }

  return { x, y, wanderAngle };
}

function getTerrainSpeedMultiplier(habitat: HabitatId, profile: AnimalProfile) {
  if (habitat === 'lake' && !profile.foodHabitats.includes('lake')) {
    return 0.58;
  }

  if (habitat === 'forest' && profile.preferredHabitats.forest) {
    return 1.04;
  }

  if (habitat === 'hill' && !profile.preferredHabitats.hill) {
    return 0.88;
  }

  return 1;
}

function findNearestAnimal(
  point: Point,
  animals: Animal[],
  predicate: (animal: Animal) => boolean,
) {
  let nearest: { item: Animal; distance: number } | null = null;

  for (const animal of animals) {
    if (!predicate(animal)) {
      continue;
    }

    const distance = getDistance(point, animal);

    if (!nearest || distance < nearest.distance) {
      nearest = { item: animal, distance };
    }
  }

  return nearest;
}

function countSpecies(animals: Animal[], speciesId: SpeciesId) {
  return animals.filter((animal) => animal.speciesId === speciesId).length;
}

function isInsideEllipse(point: Point, zone: HabitatZone) {
  const dx = (point.x - zone.center.x) / zone.radiusX;
  const dy = (point.y - zone.center.y) / zone.radiusY;
  return dx * dx + dy * dy <= 1;
}

function getDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomAngle(random: () => number) {
  return random() * Math.PI * 2;
}

function clampPoint(point: Point): Point {
  return {
    x: clamp(point.x, 3, meadowWidth - 3),
    y: clamp(point.y, 3, meadowHeight - 3),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function blendAngles(from: number, to: number, amount: number) {
  const difference = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + difference * amount;
}

function addEvents(eventLog: string[], elapsedMs: number, events: string[]) {
  if (events.length === 0) {
    return eventLog;
  }

  const stampedEvents = events.map((event) => `${formatElapsedTime(elapsedMs)} ${event}`);
  return [...stampedEvents, ...eventLog].slice(0, maxEventLogItems);
}
