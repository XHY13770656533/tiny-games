export type PetInteraction = 'feed' | 'drink' | 'play';
export type PetPose = 'left' | 'center' | 'right';

export type IdleScene = {
  id: string;
  title: string;
  message: string;
  pose: PetPose;
  motion: 'wander' | 'sniff' | 'rest' | 'bounce';
};

export type InteractionResponse = {
  action: PetInteraction;
  title: string;
  message: string;
  itemLabel: string;
  motion: 'nibble' | 'sip' | 'jump';
};

export const idleScenes: IdleScene[] = [
  {
    id: 'wander-left',
    title: '自由散步',
    message: '小糯沿着垫子边缘慢慢走，像是在巡视自己的小天地。',
    pose: 'left',
    motion: 'wander',
  },
  {
    id: 'sniff-center',
    title: '好奇探索',
    message: '小糯停下来闻了闻空气，好像发现了一个不存在的小秘密。',
    pose: 'center',
    motion: 'sniff',
  },
  {
    id: 'bounce-right',
    title: '轻轻蹦跳',
    message: '小糯开心地蹦了两下，然后继续在房间里晃悠。',
    pose: 'right',
    motion: 'bounce',
  },
  {
    id: 'rest-center',
    title: '短暂休息',
    message: '小糯蜷在软垫上眯了一会儿，耳朵还在慢慢晃。',
    pose: 'center',
    motion: 'rest',
  },
];

export const interactionResponses: Record<PetInteraction, InteractionResponse> = {
  feed: {
    action: 'feed',
    title: '喂食',
    message: '小糯捧着小点心认真啃了几口，尾巴摇得很轻快。',
    itemLabel: '小点心',
    motion: 'nibble',
  },
  drink: {
    action: 'drink',
    title: '喝水',
    message: '小糯低头喝了一口清水，抬头时嘴边还亮晶晶的。',
    itemLabel: '清水碗',
    motion: 'sip',
  },
  play: {
    action: 'play',
    title: '玩耍',
    message: '小糯追着毛线球绕了一圈，最后得意地坐回你面前。',
    itemLabel: '毛线球',
    motion: 'jump',
  },
};

export function getNextIdleSceneIndex(currentIndex: number) {
  return (currentIndex + 1) % idleScenes.length;
}

export function createMemory(response: InteractionResponse) {
  return `${response.title}：${response.itemLabel}`;
}
