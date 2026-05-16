# Tiny Games

Tiny Games 是一个纯前端小游戏集锦项目，目标是用轻量、清晰、可持续扩展的方式沉淀多个浏览器小游戏。当前仓库已经包含基础 Vite + React + TypeScript 工程、游戏导航页、统一游戏布局、游戏注册表，以及后续 vibe coding 所需的协作文档。

## 当前状态

- 已搭建 Vite + React + TypeScript 基础工程
- 已实现首页游戏导航
- 已抽象 `GameCard`、`GameLayout`、`GamePlaceholder` 等通用组件
- 已建立 `src/data/games.ts` 游戏注册表
- 已提供两个可玩游戏：电子宠物、井字棋
- 已预留翻牌记忆、贪吃蛇、2048、扫雷、打砖块等游戏目录和路由
- 已补充 `agent.md`、架构文档和 vibe coding 资料

## 快速开始

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run dev      # 本地开发
npm run build    # 类型检查并构建生产产物
npm run preview  # 预览构建产物
npm run lint     # 运行 ESLint
```

## 项目结构

```txt
src/
├── App.tsx
├── main.tsx
├── router.tsx
├── components/
│   ├── AppShell/
│   ├── GameCard/
│   ├── GameLayout/
│   └── GamePlaceholder/
├── data/
│   └── games.ts
├── games/
│   ├── electronic-pet/
│   ├── tictactoe/
│   ├── memory/
│   ├── snake/
│   ├── game-2048/
│   ├── minesweeper/
│   └── breakout/
├── hooks/
├── pages/
├── styles/
├── types/
└── utils/
```

## 核心设计

### 1. 游戏注册表

所有游戏都先在 `src/data/games.ts` 注册。首页卡片、分类展示和后续搜索/收藏/最近游玩都应优先从这里读取元数据。

```ts
export const games = [
  {
    id: 'tictactoe',
    title: '井字棋',
    path: '/games/tictactoe',
    category: 'strategy',
    difficulty: 'easy',
    status: 'available',
  },
];
```

### 2. 统一游戏布局

具体小游戏页面通过 `GameLayout` 复用页面壳，包括返回首页、标题、描述、操作区、侧栏说明和游戏舞台。

### 3. 游戏逻辑与 UI 分离

新增小游戏时建议保持：

```txt
src/games/<game-id>/
├── index.tsx        # 组件入口和交互编排
├── logic.ts         # 纯规则函数
├── types.ts         # 可选，复杂游戏类型定义
└── styles.module.css
```

井字棋目录已经作为可参考样板。

## 新增小游戏流程

1. 在 `src/games/<game-id>/` 创建游戏目录
2. 拆分 `index.tsx`、`logic.ts`、`styles.module.css`
3. 在 `src/data/games.ts` 添加游戏元数据
4. 在 `src/router.tsx` 添加游戏路由
5. 使用 `GameLayout` 包裹游戏主体
6. 运行 `npm run lint` 和 `npm run build`
7. 更新必要文档

## 后续路线建议

优先级建议：

1. 继续打磨电子宠物：补充更多空闲动作、环境物件和触控细节
2. 完成翻牌记忆：低复杂度，适合验证动画和计步
3. 完成 2048：适合沉淀纯逻辑测试思路
4. 完成贪吃蛇：适合沉淀键盘控制和游戏循环
5. 完成扫雷：适合棋盘建模和递归展开
6. 完成打砖块：适合引入 Canvas 渲染

更多协作约定见：

- [`agent.md`](./agent.md)
- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/vibe-coding/playbook.md`](./docs/vibe-coding/playbook.md)
- [`docs/vibe-coding/prompt-library.md`](./docs/vibe-coding/prompt-library.md)
- [`docs/vibe-coding/game-brief-template.md`](./docs/vibe-coding/game-brief-template.md)