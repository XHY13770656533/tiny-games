import GamePlaceholder from '../../components/GamePlaceholder/GamePlaceholder';

export default function WheelBattleGame() {
  return (
    <GamePlaceholder
      title="转盘大作战"
      description="战前组装转盘，战斗中战机自动开火。能量满一次就存一次转动机会，在合适窗口按下强化；一局结束后用金币升级部分效果。"
      milestones={[
        '实现 18 种扇区图鉴与转盘组装：4–7 格、权重总和 100，进入战斗后方案锁定',
        '实现自动空战：固定战机、三航道敌机、自动锁定开火、漏敌扣血，没有走位',
        '接通能量与次数：满条 +1 次转动机会，可叠到 3 次，玩家自选时机转动',
        '补齐局后养成：结算发金币，10 种效果可升到 Lv3，解锁与升级写入 localStorage',
      ]}
    />
  );
}
