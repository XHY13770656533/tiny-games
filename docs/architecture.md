# Tiny Games 架构设计

## 架构目标

Tiny Games 需要支持持续增加小游戏，同时保持入口统一、代码边界清晰、实现成本可控。

```txt
App
└── Router
    ├── HomePage
    │   └── GameCard 列表
    │       └── games.ts
    └── GameRoute
        └── GameLayout
            └── 具体小游戏组件
```

## 模块职责

### `src/data/games.ts`

游戏注册表，维护首页和后续扩展功能需要的元数据：

- id
- title
- description
- path
- category
- difficulty
- status
- tags
- accentColor

任何新增游戏都应从这里注册。

### `src/router.tsx`

维护页面路由。每个游戏有独立路径，建议统一为：

```txt
/games/<slug>
```

### `src/components/GameLayout`

统一游戏页面外壳，提供：

- 返回首页
- 游戏标题与描述
- 操作区
- 游戏舞台
- 侧栏说明

具体游戏不应重复实现这些页面结构。

### `src/components/GameCard`

首页卡片组件，从 `GameMeta` 渲染游戏入口。

### `src/games/<game-id>`

每个游戏独立目录，推荐结构：

```txt
index.tsx
logic.ts
types.ts
styles.module.css
```

`logic.ts` 应尽量保持为纯函数，方便阅读、复用和后续测试。

## 状态管理策略

优先级：

1. 游戏内部 `useState` / `useReducer`
2. 通用 hook，例如 `useLocalStorage`、`useKeyboard`
3. 真正出现跨游戏复杂状态后，再考虑引入轻量 store

当前阶段不引入全局状态库。

## 渲染策略

- 棋盘、卡片、按钮类游戏优先使用 DOM + CSS Grid
- 高频动画、碰撞、粒子类游戏可以使用 Canvas
- Canvas 游戏仍应通过 React 管理页面框架和生命周期

## 样式策略

- 全局变量放在 `src/styles/variables.css`
- 全局 reset 和基础组件样式放在 `src/styles/global.css`
- 组件样式使用 CSS Modules
- 避免在组件中堆叠大量 inline style，动态主题变量除外

## 扩展方向

可在现有注册表基础上扩展：

- 搜索
- 分类筛选
- 收藏
- 最近游玩
- 最高分
- PWA 离线访问
- 深色模式
- 每日挑战
