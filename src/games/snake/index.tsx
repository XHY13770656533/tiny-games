import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function SnakeGame() {
  return (
    <GamePlaceholder
      title="贪吃蛇"
      description="方向键控制蛇移动，吃到食物得分，撞墙或撞到自身结束。"
      milestones={[
        "抽离坐标、方向和碰撞逻辑",
        "实现 useKeyboard 与游戏循环",
        "补充暂停、重开和最高分记录",
      ]}
    />
  );
}
