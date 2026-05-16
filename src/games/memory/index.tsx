import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function MemoryGame() {
  return (
    <GamePlaceholder
      title="翻牌记忆"
      description="翻开卡片并匹配相同图案，后续可加入计步、计时和翻转动画。"
      milestones={[
        "定义卡片数据与洗牌函数",
        "实现翻牌、匹配和锁定状态",
        "接入计步、计时与胜利判断",
      ]}
    />
  );
}
