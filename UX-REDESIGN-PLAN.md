# Vibe Overlay — UX 重构落地计划（R1 + R2 + R3）

> 基于 `UX-REDESIGN-PROPOSAL.md` 的已确认决策：
> 1. R1 仅做容器换皮，保留所有现有编辑器子组件不动
> 2. 本轮范围：R1 → R2 → R3；R4（命令面板 / 快捷键）后续再做
> 3. 不保留旧的 280px 左侧面板

## 现状盘点

- `EditorPanel.tsx` 1095 行，所有 Tab 字段塞同一根滚动条
- `App.tsx` 411 行，用左面板 + 右舞台两栏布局
- 已存在的可复用 shadcn/ui：`sheet.tsx`（抽屉）、`accordion.tsx`、`collapsible.tsx`、`dropdown-menu.tsx`、`alert-dialog.tsx`、`tooltip.tsx`、`command.tsx`（R4 备用）
- 已存在的子编辑器（**保留不动**）：
  - `BadgesEditor` `SocialsEditor` `SidebarSectionEditor`
  - `BottomBarSegmentEditor` `LiveSessionEditor` `StackEditor` `WallpaperEditor`
- 已存在的内置 helper：`SectionInput` `ToggleButton` `ColorInput` `SectionHeading` `ExportButton`（在 EditorPanel.tsx 文件顶部，需要抽出共用）

## 目标布局

```
┌────────────────────────────────────────────────────────────┐
│  TopBar  Vibe ⚡  [Overlay·Cover·Poster·Wallpaper]  ⚙ ⤓▾  │  56px
├──────────────────────────────────┬─────────────────────────┤
│                                  │  Inspector              │
│      Preview Stage               │  ─────────              │
│      (双击文字直接改 — R3)        │  按 Tab 上下文动态分组   │
│                                  │  Accordion 折叠组       │
│                                  │  默认全展开             │
└──────────────────────────────────┴─────────────────────────┘
                                       320px 固定（可折叠）
```

---

## R1 — 骨架重构（容器换皮）

**目标：** 顶栏 + 右抽屉 + 中央舞台跑通；旧子组件零修改地搬过去。

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/components/topbar/TopBar.tsx` | 56px 顶栏：Brand mark · Tab segmented · Theme switcher · Export menu · Settings 按钮 |
| `src/components/topbar/ExportMenu.tsx` | 主按钮 = 当前 Tab 导出，下拉项覆盖其它 5 个导出 |
| `src/components/inspector/Inspector.tsx` | 320px 右抽屉壳，按 `state.activeTab` 渲染对应分组容器 |
| `src/components/inspector/InspectorGroup.tsx` | Accordion item 包装，统一 padding/heading 样式 |
| `src/components/inspector/groups/OverlayInspector.tsx` | Overlay Tab 的折叠组容器 |
| `src/components/inspector/groups/CoverInspector.tsx` | Cover Tab |
| `src/components/inspector/groups/PosterInspector.tsx` | Poster Tab |
| `src/components/inspector/groups/WallpaperInspector.tsx` | Wallpaper Tab |
| `src/components/SettingsDrawer.tsx` | Sheet 抽屉：主题切换 · 颜色 · Reset Defaults |
| `src/components/shared/Field.tsx` | 抽出 `SectionInput` `ToggleButton` `ColorInput` 三件套，原文件保留以兼容 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/App.tsx` | 删除左侧 `<EditorPanel>`；插入 `<TopBar>` + `<Inspector>`；保留所有 ref/handler 不动；舞台容器适配 right=320 |
| `src/components/EditorPanel.tsx` | **整文件删除**（被新 Inspector 取代），但需在删除前把内部 `Field/Toggle/ColorInput` helpers 提取到 `shared/Field.tsx`，导出按钮提取到 `topbar/ExportMenu.tsx` |

### R1 验收

- 4 个 Tab 切换正常，所有原字段都能被找到（按 Tab 看在 Inspector 默认展开的折叠组里）
- 主题切换、Reset、6 个导出动作全部可用
- 删除旧 EditorPanel 后 typecheck/test/build 全绿

### R1 风险

- **html-to-image 截图节点**：现有 `exportStageStyle` 的离屏节点不要动；导出按钮只换调用入口
- **localStorage 兼容**：`stateStorage.ts` 不动，旧 `activeTab` 值仍是 4 选 1，不需要迁移
- **测试**：现有 3 个测试只覆盖 stateStorage，与 UI 无关，不会因 UI 重构挂掉

---

## R2 — Inspector 分组 + Brand 合并

**目标：** Cover/Poster/Wallpaper 三处的 "Avatar / Title / Badges" 抽成一个共享组件，颜色板收进 Settings 抽屉。

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/components/inspector/BrandIdentityEditor.tsx` | Avatar 上传（`avatarInputRef` 内置）+ Title + Subtitle + Badges。一份组件，三个 Tab 复用 |

### 分组方案（R2 后的最终形态）

| Tab | 折叠组（Accordion） |
|------|--------------------|
| Overlay | **Sections**（active + 三节内容，复用 `SidebarSectionEditor`）·**Live Bar**（`LiveSessionEditor` + `StackEditor` + 三个 `BottomBarSegmentEditor`）·**Visibility**（5 个 `ToggleButton`） |
| Cover | **Brand**（`BrandIdentityEditor`）·**Today's Build**（todayLabel/todayTopic + Subtitle）·**Socials**（`SocialsEditor`，目前 Cover Tab 没有，确认是否需要——参考 `Cover.socialVisible` 已经在 state 里） |
| Poster | **Brand**（同上）·**Today's Build** ·**Manifesto**（line1-3 + visible toggle）·**Socials** |
| Wallpaper | **Size**（preset picker）·**Brand Label & Slogan** ·**Visibility**（avatar/badges/social 三个 toggle）— 已在 `WallpaperEditor` 里实现，直接挂进来 |

### 收敛

- 颜色板 11 个 ColorInput → 移入 `SettingsDrawer`，主层级不再常驻
- Theme switcher 也搬进 SettingsDrawer，TopBar 只留 ⚙ 触发器
- Inspector 头加一行小字 "Brand fields are shared across Cover · Poster · Wallpaper"

### R2 验收

- Cover/Poster Tab 视觉上"瘦了一半"——不再有重复的 Avatar 上传按钮
- 改一次头像/标题，三个 Tab 同时反映
- 设置抽屉打开/关闭顺滑，Reset 弹窗正常

---

## R3 — 预览即编辑（Direct Manipulation P1）

**目标：** 预览舞台上的标题、副标题、Topic、徽标 label、社交 value 双击即可行内编辑。

### 范围

可双击编辑的字段（5 个 hot-region）：

| Canvas | 字段 | 绑定 state |
|--------|------|----------|
| Cover · Poster · Wallpaper | 大标题 | `cover.title` |
| Cover · Wallpaper | 副标题 / Slogan | `cover.hookText` / `wallpaper.slogan` |
| Cover · Poster | Today's Topic | `cover.todayTopic` |
| Cover · Poster | Today's Label | `cover.todayLabel` |
| Cover · Poster · Wallpaper | Badge label（每条） | `cover.badges[i].label` |

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/components/edit/EditableText.tsx` | 通用 inline-editable 文字组件：双击触发，contentEditable，Enter 提交，Esc 取消，blur 自动提交。封装 hover 描边 + 铅笔 affordance |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/components/CoverCanvas.tsx` | title / hookText / todayLabel / todayTopic / badge.label 包裹 `EditableText` |
| `src/components/PosterCanvas.tsx` | 同上（无 hookText） |
| `src/components/WallpaperCanvas.tsx` | title / slogan / badge.label |

### R3 关键约束

- **导出节点不能可编辑**：`EditableText` 接受 `readonly?: boolean` prop。离屏 export 节点传 `readonly=true`，预览节点传 `false`
- **html-to-image 兼容性**：contentEditable 元素在 export 时要确保不渲染 caret/outline，`readonly=true` 模式直接 render 成纯 span
- **CJK 输入法**：用 `compositionstart/end` 事件门控 onChange，避免拼音中途触发 state 更新
- **缩放容器内的双击**：`PreviewFrame` 用 `transform: scale()`，事件坐标不会受影响，但要确认 hover 描边在 1px 缩放后不糊

### R3 验收

- 双击预览中的标题，光标准确进入文字处
- Enter 提交、Esc 还原、blur 提交各自正确
- 中文输入法连打 5 个字，state 只在最终回车后更新一次（视觉无闪烁）
- 同一字段在 Inspector 里同步反映新值
- 导出 PNG 不带蓝色描边或铅笔图标

### R3 测试补充

新增 `src/components/edit/EditableText.test.ts`（仅 happy path + IME 守卫的纯逻辑测试）。

---

## 推进节奏

每个 R 一个 commit；每个 commit 前跑 `pnpm --filter @workspace/vibe-overlay run typecheck && test && build`。

| Step | 内容 | 改动量预估 |
|------|------|-----------|
| R1.1 | 抽出 `shared/Field.tsx`（保留旧用法） | ~120 行新文件 |
| R1.2 | 新建 `TopBar/ExportMenu/SettingsDrawer` | ~250 行新文件 |
| R1.3 | 新建 `Inspector` + 4 个 group container（先把旧 EditorPanel 字段原样拷过去） | ~400 行新文件 |
| R1.4 | 改 `App.tsx` 装新壳，删除 `EditorPanel.tsx`（1095 行 - ~700 行已迁移 = 净减 ~400 行） | App.tsx ~30 行 diff |
| R1.5 | typecheck / test / build / commit | — |
| R2.1 | 新建 `BrandIdentityEditor`，三 Tab 替换重复块 | ~180 行新文件 |
| R2.2 | 颜色板 + 主题切换搬进 `SettingsDrawer` | — |
| R2.3 | typecheck / test / build / commit | — |
| R3.1 | 新建 `EditableText`，加 IME 守卫测试 | ~140 行新文件 |
| R3.2 | 三个 Canvas 文件挂载 `EditableText`（readonly 守卫） | 各 ~30 行 diff |
| R3.3 | typecheck / test / build / commit | — |

预计三个 commit；总改动 ~1500 行（多数是新建，旧文件删除净 -400 行）。

---

## 不动的边界

下面这些不在本轮范围内，避免 scope creep：

- ❌ R4：命令面板（⌘K）、快捷键（⌘1–4 / ⌘E / ⌘Z）、撤销栈
- ❌ 拖拽徽标重排
- ❌ 改 state 形状或迁移 localStorage
- ❌ 改任何已落地的视觉效果（颜色、字号、间距）
- ❌ 改导出尺寸 / `html-to-image` 选项
- ❌ 修改 `BadgesEditor / SocialsEditor / SidebarSectionEditor / BottomBarSegmentEditor / LiveSessionEditor / StackEditor / WallpaperEditor` 任何一个

如果在实现过程中发现某个旧组件不改不行，先停下问。
