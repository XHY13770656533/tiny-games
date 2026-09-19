import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function WheelBattleGame() {
  return (
    <GamePlaceholder
      title="转盘大作战"
      description="战前组装转盘，战斗中战机自动开火。能量满一次就存一次转动机会，在合适窗口按下强化，守住基地并击败关底 Boss。"
      milestones={[
        '实现转盘组装：4–7 个扇区、权重总和 100，进入战斗后方案锁定',
        '实现自动空战：固定战机、三航道敌机、自动锁定开火、漏敌扣血，没有走位',
        '接通能量与次数：满条 +1 次转动机会，可叠到 3 次，玩家自选时机转动',
        '补齐 3 关 Boss 与预报窗口：铁甲甲虫、双子无人机、赤红母舰，并记录最高分',
      ]}
    />
  );
}
