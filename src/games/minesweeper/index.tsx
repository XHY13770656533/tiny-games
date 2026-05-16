import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function MinesweeperGame() {
  return (
    <GamePlaceholder
      title="扫雷"
      description="根据数字提示避开地雷并展开安全区域。"
      milestones={[
        "生成地雷棋盘和邻近计数",
        "实现空白区域递归展开",
        "接入旗帜标记、胜负判断和难度设置",
      ]}
    />
  );
}
