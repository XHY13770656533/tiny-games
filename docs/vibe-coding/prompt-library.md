# Prompt Library

## 新增翻牌记忆

```txt
请实现翻牌记忆游戏，替换当前 src/games/memory 的占位页。
要求：
- 4x4 卡片网格
- 每次翻两张，匹配成功则锁定
- 记录步数和用时
- 完成后显示胜利状态和重新开始按钮
- 逻辑拆分到 logic.ts
- 运行 npm run lint 和 npm run build
```

## 新增 2048

```txt
请实现 2048 游戏，替换当前 src/games/game-2048 的占位页。
要求：
- 4x4 棋盘
- 支持方向键控制
- 合并数字并计算分数
- localStorage 记录最高分
- 滑动/合并逻辑使用纯函数
- 运行 npm run lint 和 npm run build
```

## 新增转盘大作战

```txt
请按 docs/games/wheel-battle.md 实现转盘大作战，替换当前 src/games/wheel-battle 的占位页。
要求：
- 使用现有 GameLayout
- 逻辑拆到 logic.ts，主循环用 requestAnimationFrame，卸载时清理
- 战场用 Canvas：三航道自动空战，战机固定在底部自动锁定开火，没有走位、瞄准或放置防御塔
- 击落敌机积能量；每满 100 获得 1 次转动机会，机会可叠到 3，玩家自行选择时机转动
- 转盘只能在战斗外组装 4–7 个扇区，单格 8–40，权重总和 100；进入战斗后方案锁定
- 扇区图鉴 18 种，至少覆盖维修、护甲、速射、散射、穿甲、清屏、激光、无人机、EMP、打捞
- 其中 10 种效果可用局后金币升级到 Lv3；金币、升级、解锁分别写入 tiny-games:wheel-battle:coins / upgrades / unlocked
- 波次和 Boss 技能需要预报窗口，供玩家决定何时转动
- 3 关，每关末尾有独立机制 Boss，第 3 关为赤红母舰三阶段
- localStorage 同时记录最高分，key 为 tiny-games:wheel-battle:high-score
- 键盘 Space 与触控点按都能转动，窄屏不出现摇杆
- 完成后把 games.ts 的 status 改为 available，并运行 npm run lint 和 npm run build
```

## 新增贪吃蛇

```txt
请实现贪吃蛇游戏，替换当前 src/games/snake 的占位页。
要求：
- 支持方向键控制
- 支持暂停和重新开始
- 吃到食物加分并增长
- 撞墙或撞到自身游戏结束
- 清理所有定时器和键盘监听
- 运行 npm run lint 和 npm run build
```

## 首页增强：搜索和分类

```txt
请为首页游戏导航增加搜索和分类筛选。
要求：
- 搜索 title、description、tags
- 分类来源使用 GameCategory
- 保持 games.ts 为唯一数据源
- 窄屏可用
- 运行 npm run lint 和 npm run build
```

## 增加最近游玩

```txt
请为 Tiny Games 增加最近游玩功能。
要求：
- 进入任意游戏时记录 game id 和时间
- 使用 localStorage 保存
- 首页展示最近游玩区域
- 处理 games.ts 中不存在的旧 id
- 运行 npm run lint 和 npm run build
```

## 扩展电子宠物互动

```txt
请扩展电子宠物游戏的互动体验。
要求：
- 保持没有健康度、生命值或失败惩罚的设定
- 新增互动时更新 src/games/electronic-pet/logic.ts
- 小动物的视觉变化放在 styles.module.css
- 如果新增动物，需要同步 petProfiles、动物选择器样式和 README/Roadmap
- 空闲行为和玩家互动需要有清晰区分
- 运行 npm run lint 和 npm run build
```


## 为电子宠物新增动物形象

```txt
请为电子宠物新增一个可选择的小动物形象。
要求：
- 在 src/games/electronic-pet/logic.ts 的 petProfiles 中注册
- 在 styles.module.css 中新增 animal-* 视觉样式
- 保持眼睛跟随鼠标、互动道具动画和空闲行为可复用
- 不增加健康度、生命值或失败惩罚
- 运行 npm run lint 和 npm run build
```
