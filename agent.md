# Agent Guide

本文档面向后续参与 Tiny Games 的 AI coding agent 和人类协作者，用于保持项目架构、代码风格和扩展路径一致。

## 项目目标

Tiny Games 是一个纯前端小游戏集锦。项目不依赖后端服务，优先通过浏览器能力、React 状态、CSS、Canvas 和 localStorage 完成游戏体验。

核心目标：

- 首页提供清晰的小游戏导航
- 每个游戏有独立路由和独立目录
- 游戏元数据统一注册
- 通用页面壳和组件可复用
- 游戏逻辑尽量独立为纯函数
- 后续可以通过 vibe coding 快速扩展新游戏

## 技术栈

- Vite
- React
- TypeScript
- React Router
- CSS Modules
- ESLint

## 重要目录

```txt
src/data/games.ts        # 游戏注册表
src/router.tsx           # 路由配置
src/components/          # 跨游戏复用组件
src/games/               # 具体小游戏
src/hooks/               # 通用交互 hook
src/utils/               # 通用纯函数
src/styles/              # 全局样式变量
```

## 开发原则

1. **先读现有结构再改动**：新增游戏前先参考 `src/games/tictactoe`。
2. **元数据统一注册**：首页展示的信息必须来自 `src/data/games.ts`。
3. **逻辑与 UI 分离**：复杂规则放到 `logic.ts`，React 组件负责交互编排和渲染。
4. **状态局部优先**：单个游戏内部状态优先放在游戏组件中；跨游戏数据再考虑 hook 或 store。
5. **少引依赖**：小游戏常见需求优先用平台能力和现有工具解决。
6. **可访问性不缺席**：按钮、棋盘格、Canvas 替代说明等需要基本 aria 文案。
7. **移动端可用**：新增布局默认考虑窄屏，键盘游戏后续补充触控方案。
8. **可验证**：提交前运行 `npm run lint` 与 `npm run build`。

## 新增游戏清单

新增一个游戏时至少完成：

- [ ] `src/games/<game-id>/index.tsx`
- [ ] `src/games/<game-id>/logic.ts`，如果存在非平凡规则
- [ ] `src/games/<game-id>/styles.module.css`
- [ ] `src/data/games.ts` 注册元数据
- [ ] `src/router.tsx` 注册路由
- [ ] README 或 docs 中更新说明，若行为明显变化
- [ ] 运行 lint/build

## 命名约定

- 游戏 id 使用 kebab-case，例如 `game-2048`、`minesweeper`
- 路由使用 `/games/<slug>`
- 组件文件夹使用 PascalCase，例如 `GameLayout`
- 游戏目录使用 kebab-case，例如 `tictactoe`、`game-2048`
- CSS Modules 文件名使用 `*.module.css`

## 游戏状态持久化

最高分、最近游玩、收藏等轻量数据优先使用 `localStorage`。可以复用 `src/hooks/useLocalStorage.ts`，key 建议使用命名空间：

```txt
tiny-games:<game-id>:high-score
tiny-games:recently-played
tiny-games:favorites
```

## Agent 工作流

1. 明确本次任务影响的游戏或通用模块
2. 阅读相关目录和 `src/data/games.ts`
3. 做最小但完整的实现
4. 保持 UI、逻辑、样式边界清晰
5. 运行校验命令
6. 提交时使用描述性 commit message

## 常见风险

- 在游戏组件中堆叠过多规则逻辑，导致后续难以测试
- 新游戏忘记注册路由或元数据
- 键盘事件未清理，造成重复监听
- 定时器、动画帧没有在卸载时释放
- Canvas 游戏缺少响应式尺寸处理
- 只考虑桌面键盘，忽略移动端操作入口
