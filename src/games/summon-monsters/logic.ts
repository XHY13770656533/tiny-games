export type MonsterAttribute =
  | 'fire'
  | 'ice'
  | 'shadow'
  | 'toxic'
  | 'thunder'
  | 'stone'
  | 'spirit'
  | 'beast';

export type Monster = {
  id: string;
  name: string;
  title: string;
  emoji: string;
  attribute: MonsterAttribute;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spell: string;
  description: string;
};

export type Hero = {
  name: string;
  title: string;
  emoji: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  weaknesses: MonsterAttribute[];
  resistances: MonsterAttribute[];
  description: string;
};

export type LevelConfig = {
  id: number;
  name: string;
  summonSeconds: number;
  hero: Hero;
  briefing: string;
};

export type BattleForecast = {
  monsterScore: number;
  heroScore: number;
  victoryChance: number;
  advantageTags: string[];
};

export type BattleResult = BattleForecast & {
  victory: boolean;
  roll: number;
  lines: string[];
};

export const attributeLabels: Record<MonsterAttribute, string> = {
  fire: '火焰',
  ice: '寒霜',
  shadow: '暗影',
  toxic: '毒素',
  thunder: '雷电',
  stone: '岩石',
  spirit: '灵魂',
  beast: '野兽',
};

export const monsters: Monster[] = [
  {
    id: 'bone-drummer',
    name: '骷髅鼓手',
    title: '节拍很邪恶',
    emoji: '🥁',
    attribute: 'shadow',
    hp: 62,
    attack: 25,
    defense: 8,
    speed: 18,
    spell: '骨头敲三下，勇者腿打架！',
    description: '用骨棒敲出扰乱步伐的节拍，适合压制行动敏捷的勇者。',
  },
  {
    id: 'mud-gob',
    name: '沼泽泥怪',
    title: '铠甲拌饭师',
    emoji: '🟤',
    attribute: 'toxic',
    hp: 88,
    attack: 20,
    defense: 20,
    speed: 6,
    spell: '泥巴开饭了，把铠甲拌成粥。',
    description: '黏住盾牌和靴子，能把正面强攻拖成泥潭摔跤。',
  },
  {
    id: 'shadow-cat',
    name: '暗影猫妖',
    title: '九条影子',
    emoji: '🐈',
    attribute: 'shadow',
    hp: 54,
    attack: 32,
    defense: 9,
    speed: 32,
    spell: '月亮眨眼，黑猫借我九条影。',
    description: '专门从影子里偷袭，爆发高但不太耐打。',
  },
  {
    id: 'hotpot-fiend',
    name: '火锅炎魔',
    title: '微辣是谎言',
    emoji: '🌶️',
    attribute: 'fire',
    hp: 76,
    attack: 36,
    defense: 14,
    speed: 14,
    spell: '锅底翻红浪，辣到勇者喊投降！',
    description: '把战场熬成红油锅，特别克制怕热的重甲勇者。',
  },
  {
    id: 'freezer-sprite',
    name: '冰箱雪灵',
    title: '冷笑话之王',
    emoji: '❄️',
    attribute: 'ice',
    hp: 58,
    attack: 29,
    defense: 11,
    speed: 26,
    spell: '霜花落满门，冷笑冻住剑。',
    description: '让剑刃结霜、让斗志打喷嚏，擅长削弱火热攻势。',
  },
  {
    id: 'stone-guard',
    name: '石像保安',
    title: '必须登记',
    emoji: '🗿',
    attribute: 'stone',
    hp: 118,
    attack: 24,
    defense: 30,
    speed: 4,
    spell: '门口站三年，谁来都要登记。',
    description: '慢得像规章制度，但能硬吃很多伤害。',
  },
  {
    id: 'storm-crow',
    name: '雷云乌鸦',
    title: '嘎嘎带闪电',
    emoji: '🐦‍⬛',
    attribute: 'thunder',
    hp: 60,
    attack: 34,
    defense: 10,
    speed: 34,
    spell: '乌云借翅，雷声替我签名！',
    description: '速度极快，能用落雷打断勇者的蓄力动作。',
  },
  {
    id: 'mushroom-poet',
    name: '毒蘑菇诗人',
    title: '押韵又押命',
    emoji: '🍄',
    attribute: 'toxic',
    hp: 68,
    attack: 31,
    defense: 12,
    speed: 16,
    spell: '苔痕上墙绿，菇伞带毒香。',
    description: '用诗句传播孢子，越拖越让勇者头晕。',
  },
  {
    id: 'mirror-witch',
    name: '镜中女巫',
    title: '反射勇气',
    emoji: '🪞',
    attribute: 'spirit',
    hp: 72,
    attack: 27,
    defense: 16,
    speed: 20,
    spell: '镜里有人笑，请把勇气倒着照。',
    description: '折射攻击与信念，面对精神薄弱的勇者很有效。',
  },
  {
    id: 'cardboard-dragon',
    name: '纸箱巨龙',
    title: '快递已喷火',
    emoji: '📦',
    attribute: 'beast',
    hp: 96,
    attack: 38,
    defense: 18,
    speed: 12,
    spell: '纸箱一张嘴，喷出快递火！',
    description: '看起来像纸箱，实际上是会喷火的纸箱。',
  },
];

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: '村口试胆',
    summonSeconds: 45,
    briefing: '第一个勇者刚从新手村出门，盔甲还没拆吊牌。抓紧练习完整输入咒语。',
    hero: {
      name: '阿勇',
      title: '见习木剑勇者',
      emoji: '🧑‍🌾',
      hp: 135,
      attack: 26,
      defense: 8,
      speed: 8,
      weaknesses: ['shadow', 'toxic'],
      resistances: ['stone'],
      description: '勇气很足，经验很少，容易被阴影和毒蘑菇吓到。',
    },
  },
  {
    id: 2,
    name: '银盔冲锋',
    summonSeconds: 43,
    briefing: '银盔剑士开始认真冲阵，笨重金属怕火也怕雷。',
    hero: {
      name: '赛琳',
      title: '银盔剑士',
      emoji: '🛡️',
      hp: 205,
      attack: 38,
      defense: 16,
      speed: 13,
      weaknesses: ['fire', 'thunder'],
      resistances: ['beast', 'stone'],
      description: '防御稳定，冲刺凶猛，但导电的盔甲是明显破绽。',
    },
  },
  {
    id: 3,
    name: '圣光巡礼',
    summonSeconds: 40,
    briefing: '圣光修女会净化邪术，暗影与毒素仍能从祷词缝隙里钻进去。',
    hero: {
      name: '伊莲',
      title: '圣光修女勇者',
      emoji: '🕯️',
      hp: 260,
      attack: 45,
      defense: 22,
      speed: 10,
      weaknesses: ['shadow', 'toxic'],
      resistances: ['spirit', 'ice'],
      description: '治疗和守护能力很强，抗灵魂和寒霜法术。',
    },
  },
  {
    id: 4,
    name: '龙裔冠军',
    summonSeconds: 38,
    briefing: '龙裔冠军挥舞烈焰大剑，冰霜和岩石能压住他的爆发。',
    hero: {
      name: '格兰',
      title: '龙裔冠军',
      emoji: '🐉',
      hp: 340,
      attack: 62,
      defense: 26,
      speed: 18,
      weaknesses: ['ice', 'stone'],
      resistances: ['fire', 'thunder'],
      description: '高攻高压，火焰抗性极强，不适合只靠炎魔硬碰硬。',
    },
  },
  {
    id: 5,
    name: '传说登门',
    summonSeconds: 36,
    briefing: '传说勇者已经走到塔下。尽可能多召唤怪物，用属性克制堆出最后胜率。',
    hero: {
      name: '阿良',
      title: '传说勇者',
      emoji: '⚔️',
      hp: 455,
      attack: 78,
      defense: 34,
      speed: 24,
      weaknesses: ['toxic', 'shadow'],
      resistances: ['fire', 'spirit'],
      description: '几乎没有短板，只能靠大量怪物和正确属性一起压制。',
    },
  },
];

export function getMonsterById(id: string) {
  return monsters.find((monster) => monster.id === id) ?? null;
}

export function getMonsterBySpell(spell: string) {
  return monsters.find((monster) => monster.spell === spell) ?? null;
}

export function calculateBattleForecast(summonedMonsters: Monster[], hero: Hero): BattleForecast {
  if (summonedMonsters.length === 0) {
    return {
      monsterScore: 0,
      heroScore: getHeroScore(hero),
      victoryChance: 3,
      advantageTags: [],
    };
  }

  const attributeSet = new Set<MonsterAttribute>();
  let monsterScore = 0;
  const advantageTags: string[] = [];

  for (const monster of summonedMonsters) {
    attributeSet.add(monster.attribute);
    const modifier = getAttributeModifier(monster.attribute, hero);
    const damage = Math.max(4, monster.attack * modifier - hero.defense * 0.42);
    const speedFactor = 1 + Math.max(-0.24, (monster.speed - hero.speed) / 120);
    const durability = monster.hp + monster.defense * 7;
    monsterScore += damage * speedFactor * 5.2 + durability * 0.34;

    if (hero.weaknesses.includes(monster.attribute)) {
      advantageTags.push(`${monster.name}克制${hero.title}`);
    }
  }

  monsterScore += attributeSet.size * 12 + Math.max(0, summonedMonsters.length - 1) * 8;

  const heroScore = getHeroScore(hero);
  const ratio = monsterScore / (monsterScore + heroScore);
  const victoryChance = clamp(Math.round(5 + 90 * ratio ** 1.08), 3, 95);

  return {
    monsterScore: Math.round(monsterScore),
    heroScore: Math.round(heroScore),
    victoryChance,
    advantageTags: advantageTags.slice(0, 4),
  };
}

export function resolveBattle(
  summonedMonsters: Monster[],
  hero: Hero,
  random = Math.random,
): BattleResult {
  const forecast = calculateBattleForecast(summonedMonsters, hero);
  const roll = Math.ceil(random() * 100);
  const victory = roll <= forecast.victoryChance;

  return {
    ...forecast,
    roll,
    victory,
    lines: createBattleLines(summonedMonsters, hero, forecast, roll, victory),
  };
}

function getHeroScore(hero: Hero) {
  return hero.hp * 1.14 + hero.attack * 5.4 + hero.defense * 7.2 + hero.speed * 4.8;
}

function getAttributeModifier(attribute: MonsterAttribute, hero: Hero) {
  if (hero.weaknesses.includes(attribute)) {
    return 1.34;
  }

  if (hero.resistances.includes(attribute)) {
    return 0.72;
  }

  return 1;
}

function createBattleLines(
  summonedMonsters: Monster[],
  hero: Hero,
  forecast: BattleForecast,
  roll: number,
  victory: boolean,
) {
  if (summonedMonsters.length === 0) {
    return [
      `${hero.title}${hero.name}推开塔门，却发现大厅里一只怪物都没有。`,
      `胜率只有 ${forecast.victoryChance}%，命运骰掷出 ${roll}。`,
      victory ? '勇者被空城计吓退了，邪恶魔法师居然过关。' : '勇者一路小跑上楼，把邪恶魔法师的披风打了个结。',
    ];
  }

  const opening = `${summonedMonsters.length} 只怪物同时冲向${hero.title}${hero.name}。`;
  const attacks = summonedMonsters.slice(0, 5).map((monster) => {
    const attributeText = attributeLabels[monster.attribute];
    return `${monster.name}发动${attributeText}攻势：${monster.description}`;
  });
  const omitted = summonedMonsters.length > attacks.length
    ? [`其余 ${summonedMonsters.length - attacks.length} 只怪物从侧翼补上邪恶的包围圈。`]
    : [];
  const result = victory
    ? `${hero.name}被怪物军团压回城门，本关通过。`
    : `${hero.name}顶住围攻冲进塔内，本关失败。`;

  return [
    opening,
    ...attacks,
    ...omitted,
    `战斗胜率 ${forecast.victoryChance}%，命运骰掷出 ${roll}。`,
    result,
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
