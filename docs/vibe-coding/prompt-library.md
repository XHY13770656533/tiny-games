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
