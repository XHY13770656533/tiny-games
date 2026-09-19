import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function WheelBattleGame() {
  return (
    <GamePlaceholder
      title="转盘大作战"
      description="在雷霆战机式战场中自动开火，积满能量后转动自己组装的转盘，用护甲、维修和特殊炮弹击败关底 Boss。"
      milestones={[
        '实现转盘组装：4–7 个扇区、权重总和 100、可预览概率',
        '实现 Canvas 战场：玩家走位、自动开火、三类敌机与对射',
        '接通能量条与转盘：满能量冻结战场，转动后立刻改变护甲、生命或武器',
        '补齐 3 关 Boss：铁甲甲虫、双子无人机、赤红母舰，并记录最高分',
      ]}
    />
  );
}
