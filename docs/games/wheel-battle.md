# 转盘大作战 · 策划案

> 状态：规划中  
> 游戏 id：`wheel-battle`  
> 路由：`/games/wheel-battle`  
> 目标平台：Tiny Games 纯前端（Vite + React + TypeScript + Canvas）  
> 参考模板：[`docs/vibe-coding/game-brief-template.md`](../vibe-coding/game-brief-template.md)

本文档是实现前的完整设计基线。后续 vibe coding 时以本文为准，优先落地「可玩闭环」，不要先做皮肤、剧情 CG 或联网排行。

---

## 游戏名称

**转盘大作战**

英文目录名：`wheel-battle`

一句话卖点：**自己组装转盘，开着战机边打边赌下一次强化。**

它不是「幸运转盘」的换皮。幸运转盘消耗金币抽奖；本作成员是纵向射击战场，转盘是玩家亲手配置的战术补给。

---

## 游戏目标

玩家驾驶一架自动开火的战机，在纵向卷轴战场中击落敌机、积攒能量、转动自制转盘获得临时强化，并在每一关末尾击败大 Boss。

通关目标：打完 3 关并击败最终 Boss「赤红母舰」。

单局追求：尽可能高的综合评分（击坠、无伤时段、Boss 速杀、剩余生命）。

---

## 体验定位

| 维度 | 选择 | 原因 |
| --- | --- | --- |
| 类型 | 反应射击 + 轻构筑 | 战场提供手感，转盘提供决策 |
| 难度 | 困难 | Boss 必须有压力，不能无脑射过去 |
| 单局时长 | 6–10 分钟 | 适合 Tiny Games，避免做成关卡编辑器 |
| 操作负担 | 低 | 飞机自动开火，玩家只管走位和转盘 |
| 随机性 | 有约束的随机 | 扇区大小 = 概率，玩家自己承担取舍 |
| 失败惩罚 | 本关重开 | 不回退已解锁扇区类型 |

与现有游戏的边界：

- 相对 `lucky-wheel`：转盘可组装，奖励作用在战场而不是金币账户。
- 相对 `breakout` / `mirror-flyer`：同属 Canvas 循环，但实体更多（敌机、双方子弹、Boss 弹幕）。

---

## 核心玩法

- 操作方式：键盘 / 鼠标拖拽 / 触控拖拽 + Canvas 渲染战场
- 胜利条件：第 3 关 Boss 生命降至 0
- 失败条件：玩家生命降至 0
- 分数规则：击坠分 + Boss 阶段分 + 剩余生命加成 + 连击加成；最高分写入 `localStorage`

### 主循环

```txt
组装转盘 → 进入关卡
    → 敌机刷新、双方对射
    → 击落敌机获得能量
    → 能量满后可转一次转盘
    → 抽到的扇区立刻改写战场状态
    → 清完波次后迎战 Boss
    → 击败 Boss 解锁新扇区 / 进入下一关
```

能量满时战场进入 **短暂停顿**（不是永久暂停菜单）：玩家必须点「转动」才能继续。这样转盘是战斗节奏的一部分，而不是可无限囤积的后台按钮。

能量溢出规则：能量条满后继续击杀会把多余能量的 30% 转为分数，不再继续蓄力。未转动前不能开始下一管能量，防止玩家把转盘拖到 Boss 战一口气连转。

---

## 战场规则（雷霆战机式）

### 空间与镜头

- 纵向卷轴，背景星空缓慢下移。
- 坐标系归一化到 `0–100`（宽）× `0–100`（高），Canvas 只负责缩放绘制。
- 玩家活动区限制在画面下半 `y ∈ [58, 92]`，左右留 4 单位边距。
- 敌机从 `y < 0` 入场，飞出 `y > 108` 后回收。

### 玩家战机

| 属性 | 初始值 | 说明 |
| --- | --- | --- |
| 生命 | 100 | 归零即失败 |
| 护甲 | 0 / 上限 80 | 先扣护甲再扣生命；护甲不自动回复 |
| 移速 | 0.42 / 帧（60fps 基准） | 斜向移动做归一化，避免对角更快 |
| 碰撞盒 | 宽 5.2 × 高 6.0 | 视觉飞机可更大，判定略小 |
| 自动炮 | 每 220ms 1 发 | 直线向上，伤害 8 |
| 特殊弹仓 | 空 | 由转盘装填，用完回到普通炮 |

受伤后有 450ms 无敌闪烁，避免同一串弹幕把生命秒空。无敌期间仍可移动和开火。

### 敌机

三类常规单位，全部由 `logic.ts` 的波次表生成，不在组件里手写刷新：

| 类型 | 生命 | 行为 | 能量掉落 | 击坠分 |
| --- | --- | --- | --- | --- |
| 侦察机 `scout` | 12 | 直线或轻正弦下压，偶尔对玩家方向射 1 发 | 12 | 30 |
| 炮艇 `gunship` | 36 | 进入 y=22 后横向游走，三连射 | 22 | 70 |
| 精英机 `elite` | 80 | 入场后画弧，扇形 5 发，被击落必掉能量 | 40 | 150 |

刷新约束：

- 同屏敌机上限 10（Boss 战时上限 6 小兵 + 1 Boss）。
- 子弹同屏上限 80，超出时优先回收已飞出屏幕的敌弹。
- 第 1 关前 12 秒只出侦察机，用来教走位。

### 碰撞

统一 AABB：

- 玩家弹 × 敌机 / Boss：扣目标生命，玩家弹消失（穿甲弹除外）。
- 敌弹 × 玩家：先扣护甲，再扣生命。
- 敌机机体 × 玩家：视为撞击，造成 18 点伤害并销毁该敌机。
- 特殊弹「脉冲清屏」不是碰撞，而是范围效果函数。

### 能量

- 能量上限 100，满条才能转盘。
- 掉落在击毁当下直接入条，不做满地捡道具，减少操作噪音。
- HUD 在能量 ≥ 100 时高亮「转动转盘」，并暂停敌机刷新与弹幕推进（玩家仍能看见冻结画面）。

---

## 转盘系统（本作成员差异点）

### 设计原则

1. **玩家决定概率，转盘决定这一次。** 扇区越大，抽中越稳。
2. **全部扇区默认是正面效果。** 没有「空奖」「扣血」格，避免自制转盘变成纯折磨。风险来自「你没把关键效果做大」。
3. **不能把转盘做成只有一个超大格。** 用数量、单格上下限卡死极端解。
4. **效果要能立刻在战场上被看见。** 护甲出盾、维修出绿十字、特殊弹改弹道。

### 组装规则

玩家在关卡开始前、以及每关 Boss 战后的整备界面组装转盘。战斗中不能改扇区，只能转动当前方案。

| 约束 | 数值 |
| --- | --- |
| 扇区数量 | 最少 4，最多 7 |
| 单格权重 | 8–40 |
| 权重总和 | 必须等于 100 |
| 同类型 | 每种效果最多 1 格 |
| 未解锁效果 | 不可装配 |

操作：

- 从已解锁效果列表「加入扇区」
- 拖动滑杆改大小；改一格时，溢出部分按比例从其他格扣减，或提示「总和超过 100，请先缩小其他格」
- 实现时推荐：**改当前格，剩余权重按其他格原比例重分配**，保证总和恒为 100，手感更顺
- 提供「平均分配」「恢复推荐方案」两个快捷按钮

推荐初始方案（教程默认）：

| 效果 | 权重 |
| --- | --- |
| 紧急维修 | 28 |
| 装甲镀层 | 24 |
| 速射强化 | 22 |
| 散射弹幕 | 26 |

### 转动表现

- 使用与幸运转盘类似的圆锥渐变绘制，但配色走战场风（红、青、琥珀）。
- 指针固定在 12 点钟。
- 旋转 3–5 圈后停在目标扇区中心角。
- 结果用一行战报写清数值：「转盘停在「装甲镀层」，护甲 +28。」
- 转动动画约 1.1s，结束后立即解冻战场。

### 效果目录

效果分四类。第一关只解锁生存与基础火力；第 2、3 关 Boss 掉落高阶效果。

#### 生存

| id | 名称 | 解锁 | 效果 | 时长 / 层数 |
| --- | --- | --- | --- | --- |
| `repair` | 紧急维修 | 开局 | 回复 22 生命 | 瞬间 |
| `armor` | 装甲镀层 | 开局 | 获得 28 护甲（可叠加，封顶 80） | 持续到被打掉 |
| `aegis` | 相位护盾 | 第 1 关 Boss | 1.8 秒完全无敌，期间仍可开火 | 1.8s |

#### 火力

| id | 名称 | 解锁 | 效果 | 时长 / 层数 |
| --- | --- | --- | --- | --- |
| `rapid` | 速射强化 | 开局 | 射速间隔改为 110ms | 6.5s |
| `spread` | 散射弹幕 | 开局 | 额外左右各 1 发，伤害 6 | 7s |
| `pierce` | 穿甲弹 | 第 1 关 Boss | 子弹穿透最多 3 个目标，对 Boss 额外 +35% | 8 发 |
| `missile` | 追踪导弹 | 第 2 关 Boss | 每 0.9s 自动补 1 枚追踪弹，伤害 16 | 5 枚 |

#### 战术

| id | 名称 | 解锁 | 效果 | 时长 / 层数 |
| --- | --- | --- | --- | --- |
| `overclock` | 过载核心 | 第 2 关 | 伤害 ×1.45，但移速 -18% | 5.5s |
| `purge` | 清屏脉冲 | 第 2 关 Boss | 清除全部敌弹，并对场上敌机造成 24 伤害 | 瞬间 |
| `time-dilation` | 时缓立场 | 第 3 关开场 | 敌机与敌弹速度 ×0.45，持续 3.2s | 3.2s |

叠层规则：

- 同类持续效果只刷新时长，不无限叠乘。
- `repair` 可以在满血时转为 10 护甲，避免「抽到回血等于浪费」。
- `purge` 对 Boss 本体只造成 24 伤害，不能一键秒杀。
- 同时最多保持 3 个持续火力效果；超出时顶掉剩余时间最短的一个。

### 组装策略（给关卡设计用）

玩家应明显感到「不是越大越好」：

- 把 `repair` 做到 40，Boss 弹幕关会缺输出窗口。
- 把 `missile` 做到 40，前期小兵战很容易空转，因为导弹对密集杂兵不如散射。
- 第 3 关 Boss 有护盾阶段，没有 `pierce` / `purge` / `overclock` 会明显拖长战斗。

不要做隐藏惩罚格。如果后期要加「变数」，优先加「双效果扇区」（例如维修量较低但附带一点护甲），而不是空白格。

---

## 关卡与 Boss

全作 3 关。每关结构固定为：

```txt
整备转盘 → 波次 A（教学/热身）→ 波次 B（混编）→ 波次 C（精英压迫）→ Boss
```

波次之间不切屏，只在 HUD 提示「下一波」。Boss 入场前清掉残余小兵，给 1.2 秒预警。

### 第 1 关 · 流星航线

- 目标：教会走位、自动开火、能量转盘。
- 时长目标：90–110 秒进入 Boss。
- 敌弹速度慢，侦察机为主。
- 精英机在波次 C 出现 1 架。

**Boss：铁甲甲虫**

- 生命 720
- 阶段 1（100%–55%）：正前方三连射 + 左右摆动。弱点是侧面，鼓励玩家左右拉扯。
- 阶段 2（55%–0%）：追加向下砸落的弹雨，每次 6 发。
- 挑战点：阶段 2 弹雨覆盖玩家常用站位，没有护甲或护盾会连续掉血。
- 击败奖励：解锁 `aegis`、`pierce`。

### 第 2 关 · 裂空峡谷

- 目标：强迫使用转盘，而不是只靠走位。
- 炮艇比例提高，夹击更常见。
- 同屏弹幕明显变密。

**Boss：双子无人机**

- 生命：左机 420 + 右机 420，必须都击破。
- 两机交替开火：一边扇形弹，一边瞄准弹。
- 当其中一架被击破，另一架进入狂暴（射速 +40%，移速 +20%）。
- 挑战点：单边输出会让残机变得极难打；散射/追踪更有价值。
- 击败奖励：解锁 `missile`、`purge`。

### 第 3 关 · 赤红母舰

- 目标：终局考试。杂兵少但准，精英机带护盾。
- 开场即解锁 `time-dilation`，提示玩家重装转盘。

**Boss：赤红母舰**

- 生命 1600，三阶段，具有真实威胁。

| 阶段 | 生命区间 | 机制 |
| --- | --- | --- |
| 装甲甲板 | 100%–70% | 正面护盾吸收 50% 普通弹伤害，穿甲弹与过载可破 |
| 弹幕核心 | 70%–35% | 环形弹 + 追踪弹各一轮，清屏脉冲在这里是保命键 |
| 过载核心 | 35%–0% | 召唤 2 架精英护卫，Boss 本体激光扫射；激光有预警线，给 0.7s 躲避 |

失败常见原因应可被转盘对策：

- 被弹幕淹没 → `aegis` / `purge` / `time-dilation`
- 打不穿护盾 → `pierce` / `overclock`
- 残血撑不到核心阶段 → 维修权重要够

击败后进入通关结算，不循环无尽模式（可在后续版本加无尽）。

---

## UI 结构

复用 `GameLayout`：返回首页、标题、说明、重新开始。游戏内部再分三块。

### 游戏舞台

1. **战场 Canvas**：飞机、敌机、子弹、Boss、背景。提供 `aria-label="转盘大作战战场"`，并用旁路文本同步生命、能量、关卡。
2. **HUD**：生命、护甲、能量、当前关卡、击坠分、进行中的效果标签。
3. **转盘覆盖层**：能量满时出现。中央是转盘，下方是「转动」按钮和当前方案缩略。
4. **整备面板**：关卡前 / Boss 后。左侧效果图鉴，右侧转盘预览与滑杆。
5. **结算面板**：胜利或失败，展示分数、最高分、本局抽到的关键效果次数。

### 操作按钮

- 开始本关 / 下一关
- 转动转盘（仅能量满）
- 加入 / 移除扇区
- 平均分配、推荐方案
- 暂停（战斗中，打开后冻结循环）
- 重新开始

### 统计信息

- 当前分 / 最高分
- 击坠数
- 转盘次数
- 受到伤害总量
- Boss 用时

### 说明侧栏

- 3 关与 Boss 一句话
- 扇区效果列表
- 操作说明：方向键 / WASD / 拖拽移动，自动开火
- 强调：扇区大小就是概率

### 窄屏

- 战场保持 3:4 画板，宽度吃满，HUD 叠在画板上缘。
- 整备面板改为上下结构：先转盘预览，再滑杆列表。
- 触控：按住战场拖拽移动战机，松手保持最后位置。
- 转盘按钮最小点击区域 44px。

---

## 状态设计

```ts
type GamePhase =
  | 'assembly'
  | 'combat'
  | 'spinning'
  | 'boss-intro'
  | 'victory'
  | 'defeat';

type EnemyType = 'scout' | 'gunship' | 'elite';
type WeaponMode = 'normal' | 'spread' | 'pierce' | 'missile';
type SectorId =
  | 'repair'
  | 'armor'
  | 'aegis'
  | 'rapid'
  | 'spread'
  | 'pierce'
  | 'missile'
  | 'overclock'
  | 'purge'
  | 'time-dilation';

type WheelSector = {
  id: SectorId;
  weight: number;
};

type ActiveEffects = {
  aegisMs: number;
  rapidMs: number;
  spreadMs: number;
  pierceShots: number;
  missileRemaining: number;
  missileCooldownMs: number;
  overclockMs: number;
  timeDilationMs: number;
};

type Vec = { x: number; y: number };

type Player = {
  position: Vec;
  hp: number;
  armor: number;
  fireCooldownMs: number;
  iFrameMs: number;
};

type Enemy = {
  id: number;
  type: EnemyType;
  position: Vec;
  hp: number;
  maxHp: number;
  fireCooldownMs: number;
};

type BossId = 'iron-beetle' | 'twin-drones' | 'crimson-carrier';

type BossState = {
  id: BossId;
  hp: number;
  maxHp: number;
  phase: number;
  patternTimerMs: number;
  extra?: Record<string, number>;
};

type BulletFaction = 'player' | 'enemy';

type Bullet = {
  id: number;
  faction: BulletFaction;
  position: Vec;
  velocity: Vec;
  damage: number;
  pierceLeft: number;
  homing: boolean;
};

type WheelBattleState = {
  phase: GamePhase;
  levelIndex: number;
  waveIndex: number;
  elapsedMs: number;
  score: number;
  kills: number;
  energy: number;
  spinReady: boolean;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  boss: BossState | null;
  effects: ActiveEffects;
  wheel: WheelSector[];
  unlockedSectors: SectorId[];
  lastSpinId: SectorId | null;
  log: string[];
  nextEntityId: number;
};
```

---

## 逻辑函数建议

全部放进 `src/games/wheel-battle/logic.ts`，组件只负责输入、rAF 和绘制。

- `createInitialState()`
- `createDefaultWheel()`
- `normalizeWheel(sectors)`：纠正 4–7 格、8–40 权重、总和 100
- `resizeSector(sectors, id, nextWeight)`
- `addSector(sectors, id)` / `removeSector(sectors, id)`
- `unlockSectors(state, ids)`
- `startLevel(state, levelIndex)`
- `tick(state, dtMs, input)`：主循环，按 phase 分流
- `movePlayer(state, input)`
- `autoFire(state, dtMs)`
- `spawnWave(state)`
- `tickEnemies(state, dtMs)`
- `tickBoss(state, dtMs)`
- `tickBullets(state, dtMs)`
- `resolveCollisions(state)`
- `grantEnergy(state, amount)`
- `beginSpin(state)`
- `finishSpin(state, random)`：按权重抽扇区并 `applySectorEffect`
- `applySectorEffect(state, id)`
- `tickEffects(state, dtMs)`
- `checkDefeat(state)` / `checkLevelClear(state)`
- `scoreKill(type)` / `scoreBossPhase(phase)`
- `buildWheelGradient(sectors)`
- `getSegmentCenterAngle(sectors, id)`

随机数从函数参数注入 `random = Math.random`，方便测试转盘权重。

---

## 输入方案

| 设备 | 移动 | 转盘 | 暂停 |
| --- | --- | --- | --- |
| 键盘 | 方向键 / WASD | `Space` 或界面按钮 | `Esc` / `P` |
| 鼠标 | 按住战场拖拽 | 点击转动 | 按钮 |
| 触控 | 单指拖拽 | 点击转动 | 按钮 |

战斗中不需要手动开火键。整备界面禁用飞机移动，避免误触。

---

## 分数与存储

```txt
tiny-games:wheel-battle:high-score
```

计分：

- 侦察机 30 / 炮艇 70 / 精英 150
- Boss 阶段转换 +400，击破 Boss +1200 / +1600 / +2200（按关卡）
- 剩余 1 点生命 +2 分（结算时一次性）
- 能量溢出转化：多余能量 × 0.3
- 连击：1.5 秒内连续击坠，从第 3 架起每架额外 +10

最高分只在胜利或失败结算时回写，避免战斗中频繁写存储。

---

## 视觉与音频范围

第一版只做视觉，不上音效库依赖。

- 战场：深蓝到墨紫渐变、星点视差、敌机用几何色块即可（三角侦察机、梯形炮艇、菱形精英）。
- 玩家机：青白三角，开火时枪口亮片。
- 护甲存在时机体描边变金。
- 无敌：透明度闪烁。
- 转盘：厚描边 + 扇区图标文字，不要复制幸运转盘的金币橙。建议主色 `#dc2626`。
- Boss：明显大于精英，带生命条。

无障碍：

- Canvas 旁必须有文字状态。
- 转动结果用 `aria-live="polite"` 播报。
- 颜色不只靠红绿区分效果，要有文字标签。

---

## 技术约束

- 页面外壳必须用 `GameLayout`。
- 样式用 CSS Modules；共享色变量放 `src/styles/variables.css`。
- 战场用 Canvas，HUD / 转盘 / 整备用 DOM，避免在 Canvas 里画复杂表单。
- `requestAnimationFrame`、键盘监听、指针监听在卸载时释放。
- 不引入物理引擎、状态库、音频库。
- 不和 `lucky-wheel` 共用 logic，避免两套转盘语义缠在一起。可复用的只有「权重抽取 + conic-gradient」思路。

建议文件：

```txt
src/games/wheel-battle/
├── index.tsx              # 阶段编排、输入、Canvas 绘制
├── logic.ts               # 纯规则与 tick
├── styles.module.css
└── （可选）render.ts      # 若绘制函数过长再拆
```

---

## 平衡初值（实现时先用这套，再微调）

| 项目 | 初值 |
| --- | --- |
| 玩家生命 | 100 |
| 玩家子弹伤害 | 8 |
| 普通射速 | 220ms |
| 侦察机弹伤害 | 8 |
| 炮艇弹伤害 | 10 |
| 精英弹伤害 | 12 |
| Boss 普通弹伤害 | 14 |
| 母舰激光伤害 | 26 |
| 能量满条 | 100 |
| 第 1 关到 Boss 期望转盘次数 | 2–3 |
| 第 2 关 | 3–4 |
| 第 3 关 | 4–5 |
| 无敌帧 | 450ms |
| 护甲上限 | 80 |

如果测试时「不转盘也能过第 2 关」，就提高炮艇密度或 Boss 伤害，而不是削弱转盘。转盘必须是过关件。

如果测试时「不走位只转盘也能过」，就加快敌弹速度、缩短无敌帧，而不是削弱维修。走位必须是生存件。

---

## 验收标准

### 策划闭环

- [ ] 可以组装 4–7 个扇区，并调整大小，总和恒为 100
- [ ] 战场自动开火，玩家只需移动
- [ ] 敌机会刷新并回击
- [ ] 击落敌机涨能量，满条后必须转动才能继续
- [ ] 转盘结果立刻改变护甲 / 生命 / 武器 / 弹幕
- [ ] 每关末尾有独立机制的 Boss，第 3 关 Boss 分阶段且具威胁
- [ ] 失败、过关、通关状态清晰，可重新开始
- [ ] 最高分写入 localStorage
- [ ] 键盘与触控都能完成一局
- [ ] 窄屏不溢出
- [ ] `npm run lint` 与 `npm run build` 通过

### 体验底线

- [ ] 不转盘时，第 2 关 Boss 应明显吃力
- [ ] 把维修做到最大、完全不装火力时，第 3 关护盾阶段应明显变慢
- [ ] 转动动画与效果结算之间没有「抽了但战场没变化」的空窗

---

## 实现分期

只做策划时不要一次写完整战斗。建议实现按四个可玩切片交付：

1. **整备 + 转盘原型**：能组装、能转、能看到效果文本。战场可先用静态占位。
2. **射击沙盒**：玩家移动、自动开火、三类敌机、能量条。
3. **把转盘接进战斗**：满能量冻结、转动、效果改射速/护甲/生命。
4. **三关 Boss**：铁甲甲虫 → 双子无人机 → 赤红母舰，补结算与最高分。

每一片都应能独立打开页面玩，而不是最后才拼起来。

---

## 非目标（第一版不做）

- 多周目成长、飞机皮肤商城、在线排行
- 玩家手动开火、切换武器快捷键
- 地图编辑器、超过 3 关的章节
- 负面扇区、金币经济
- WebAudio 音效包（可后续加）

---

## 首页元数据（定稿）

实现注册 `src/data/games.ts` 时使用：

```ts
{
  id: 'wheel-battle',
  title: '转盘大作战',
  description:
    '在雷霆战机式战场中自动开火击落敌机，积满能量后转动自己组装的转盘，用护甲、维修和特殊炮弹击败关底 Boss。',
  path: '/games/wheel-battle',
  category: 'reflex',
  difficulty: 'hard',
  status: 'planned',
  tags: ['射击', '转盘', '组装', 'Boss', 'Canvas'],
  accentColor: '#dc2626',
}
```

第一版实现完成后把 `status` 改为 `available`。
