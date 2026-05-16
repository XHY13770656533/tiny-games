# Game Brief Template

复制本模板用于描述一个新小游戏。

## 游戏名称

待填写

## 游戏目标

玩家需要完成什么目标？

## 核心玩法

- 操作方式：键盘 / 鼠标 / 触控 / Canvas
- 胜利条件：
- 失败条件：
- 分数规则：

## UI 结构

- 游戏舞台：
- 操作按钮：
- 统计信息：
- 说明侧栏：

## 状态设计

```ts
type GameState = {
  // 待填写
};
```

## 逻辑函数建议

- `createInitialState()`
- `applyMove()`
- `checkWin()`
- `checkGameOver()`

## 验收标准

- [ ] 可以开始和重新开始
- [ ] 主要玩法闭环完整
- [ ] 胜负或完成状态清晰
- [ ] 移动端不出现明显布局问题
- [ ] lint/build 通过
