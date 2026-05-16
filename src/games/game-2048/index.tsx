import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function Game2048Game() {
  return (
    <GamePlaceholder
      title="2048"
      description="滑动数字方块并合并同值数字，目标是合成 2048。"
      milestones={[
        "实现矩阵滑动和合并纯函数",
        "接入键盘与触屏滑动",
        "记录分数、最高分和撤销能力",
      ]}
    />
  );
}
