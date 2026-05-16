# Vibe Coding Playbook

本文件用于后续通过 AI / vibe coding 方式持续扩展 Tiny Games。

## 每次任务开始前

向 agent 提供：

1. 要实现的游戏或功能名称
2. 期望玩法
3. 是否需要键盘、鼠标、触控或 Canvas
4. 是否需要分数、计时、最高分或 localStorage
5. 是否需要同步更新文档

## 推荐任务粒度

优先拆成小而完整的任务：

- 新增一个具体小游戏
- 为某个游戏补充分数和最高分
- 给首页增加搜索或分类筛选
- 给 Canvas 游戏增加移动端触控
- 给已有游戏补充纯逻辑测试

避免一次性要求实现过多游戏，否则容易产生不一致的代码结构。

## 新游戏提示词模板

```txt
请在 Tiny Games 中新增一个 <游戏名> 小游戏。
要求：
- 使用现有 GameLayout
- 在 src/data/games.ts 注册元数据
- 在 src/router.tsx 注册路由
- 游戏逻辑拆到 logic.ts
- 样式使用 CSS Modules
- 支持重新开始
- 如有分数，使用 localStorage 记录最高分
- 完成后运行 npm run lint 和 npm run build
```

## 功能增强提示词模板

```txt
请为 Tiny Games 的 <游戏名> 增加 <功能>。
请先阅读 src/games/<game-id>、src/data/games.ts 和相关通用 hook。
保持现有结构，不做无关重构。
完成后运行 npm run lint 和 npm run build。
```

## Review 提示词模板

```txt
请 review 这次 Tiny Games 的改动，重点关注：
- 游戏逻辑是否正确
- React 状态和 effect 是否存在泄漏
- 路由和 games.ts 是否同步
- 移动端是否可用
- 是否需要补充文档或测试
```

## Agent 输出期望

每次实现完成后，agent 应说明：

- 改动了哪些模块
- 新增或修改了哪些游戏行为
- 运行了哪些校验命令
- 还有哪些后续建议

## 质量检查清单

- [ ] 首页能看到游戏卡片
- [ ] 点击卡片能进入正确路由
- [ ] 游戏页面能返回首页
- [ ] 重新开始按钮可用
- [ ] 键盘/计时器/动画帧在卸载时清理
- [ ] 窄屏布局不溢出
- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
