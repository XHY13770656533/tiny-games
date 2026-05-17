export type PetInteraction = 'feed' | 'drink' | 'play';
export type PetSpecies = 'fox' | 'cat' | 'bunny';
export type PetMotion =
  | 'wander'
  | 'sniff'
  | 'stretch'
  | 'roll'
  | 'nap'
  | 'pounce'
  | 'curious'
  | 'nibble'
  | 'sip'
  | 'playful';

export type PetProfile = {
  id: PetSpecies;
  name: string;
  speciesName: string;
  tagline: string;
  personality: string;
  themeClass: string;
  accentColor: string;
  favorite: string;
};

export type IdleScene = {
  id: string;
  title: string;
  message: string;
  x: number;
  motion: PetMotion;
};

export type InteractionResponse = {
  action: PetInteraction;
  title: string;
  message: string;
  itemLabel: string;
  motion: PetMotion;
};

export const petProfiles: PetProfile[] = [
  {
    id: 'fox',
    name: '小糯',
    speciesName: '暖橘小狐',
    tagline: '胆大、爱巡视，会把房间当成自己的小森林。',
    personality: '小糯喜欢绕着垫子走来走去，看到鼠标会先盯住，再轻轻扑过去。',
    themeClass: 'fox',
    accentColor: '#f97316',
    favorite: '南瓜小饼',
  },
  {
    id: 'cat',
    name: '团团',
    speciesName: '灰蓝小猫',
    tagline: '慵懒、好奇，喜欢假装不在意地观察你。',
    personality: '团团会伸懒腰、甩尾巴，鼠标经过时眼睛会立刻跟上。',
    themeClass: 'cat',
    accentColor: '#6366f1',
    favorite: '小鱼酥',
  },
  {
    id: 'bunny',
    name: '米米',
    speciesName: '奶油垂耳兔',
    tagline: '轻快、亲人，喜欢蹦跳和追逐会动的小东西。',
    personality: '米米常常原地小跳，喝水后会开心地抖抖耳朵。',
    themeClass: 'bunny',
    accentColor: '#ec4899',
    favorite: '胡萝卜片',
  },
];

export const idleScenes: IdleScene[] = [
  {
    id: 'wander-left',
    title: '自由散步',
    message: '{name}沿着垫子边缘慢慢走，像是在巡视自己的小天地。',
    x: 18,
    motion: 'wander',
  },
  {
    id: 'sniff-center',
    title: '好奇探索',
    message: '{name}停下来闻了闻空气，好像发现了一个不存在的小秘密。',
    x: 46,
    motion: 'sniff',
  },
  {
    id: 'stretch-right',
    title: '伸个懒腰',
    message: '{name}把身体拉得长长的，尾巴和耳朵也跟着晃了一下。',
    x: 75,
    motion: 'stretch',
  },
  {
    id: 'roll-center',
    title: '软垫打滚',
    message: '{name}在软垫上翻了半圈，又装作什么都没发生一样坐好。',
    x: 54,
    motion: 'roll',
  },
  {
    id: 'nap-left',
    title: '短暂休息',
    message: '{name}蜷在软垫上眯了一会儿，耳朵还在慢慢晃。',
    x: 31,
    motion: 'nap',
  },
];

export const interactionResponses: Record<PetInteraction, InteractionResponse> = {
  feed: {
    action: 'feed',
    title: '喂食',
    message: '{name}凑上前接住点心，认真啃了几口，还掉下了小碎屑。',
    itemLabel: '小点心',
    motion: 'nibble',
  },
  drink: {
    action: 'drink',
    title: '喝水',
    message: '{name}低头喝水，水面一圈圈晃开，抬头时嘴边亮晶晶的。',
    itemLabel: '清水碗',
    motion: 'sip',
  },
  play: {
    action: 'play',
    title: '玩耍',
    message: '{name}追着玩具绕了一圈，最后开心地扑到它旁边。',
    itemLabel: '毛线球',
    motion: 'playful',
  },
};

export function getNextIdleSceneIndex(currentIndex: number) {
  return (currentIndex + 1) % idleScenes.length;
}

export function getPetProfile(id: PetSpecies) {
  return petProfiles.find((profile) => profile.id === id) ?? petProfiles[0];
}

export function formatPetText(template: string, petName: string) {
  return template.replaceAll('{name}', petName);
}

export function createMemory(response: InteractionResponse, petName: string) {
  return `${response.title}：${petName} 和 ${response.itemLabel}`;
}

export function clampPetX(value: number) {
  return Math.min(88, Math.max(12, value));
}
