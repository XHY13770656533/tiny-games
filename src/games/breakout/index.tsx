import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function BreakoutGame() {
  return (
    <GamePlaceholder
      title="打砖块"
      description="控制挡板反弹小球，击碎全部砖块。"
      milestones={[
        "规划 Canvas 渲染循环",
        "实现球体、挡板、砖块碰撞",
        "加入关卡、生命值和分数系统",
      ]}
    />
  );
}
