# Vibe Overlay Builder — UX 改进方案

> 目标：让交互体验向 Claude Desktop 靠齐 —— **少、稳、近**。
> "少"=默认只露关键控件；"稳"=布局/位置不随 Tab 切换跳变；"近"=要改的东西就在它出现的位置旁。

---

## 1. 现状诊断

当前 `EditorPanel.tsx` 体量已经 **1095 行**，把所有 Tab 的所有字段一次性塞进同一根滚动条，问题集中在 5 类：

| # | 问题 | 表现 |
|---|------|------|
| 1 | **信息过载** | 单个 Tab 滚动条平均 6–10 屏；Cover/Poster Tab 几乎重复一遍（Avatar/Title/Badges/Topic 各两份） |
| 2 | **认知错位** | "改头像"散落在 Cover、Poster；改 Stack 必须在 Overlay Tab；改 Wallpaper 的 Title 又要回 Cover Tab。改一个东西要在脑子里换好几次坐标系 |
| 3 | **导航单一** | 只有左侧一根 280px 滚动条，没有"我现在在编辑什么"的锚点反馈，也没有 Cmd+K 之类的跳转 |
| 4 | **导出动作沉底** | 6 个 Export 按钮一字排开堆在最底部，导出当前 Tab 内容必须先滚到底；不同尺寸的 PNG 用同一种视觉权重 |
| 5 | **直接操作缺失** | 预览画布是只读的——改文字必须切到左边面板找对应字段，违背 Claude Desktop "点哪改哪"的肌肉记忆 |

---

## 2. 设计原则（参照 Claude Desktop）

1. **预览即编辑（Direct Manipulation）** —— 文字、徽标、社交项尽量"双击预览即可改"。
2. **三段式版式** —— 顶部最小工具条 / 中央预览舞台 / 右侧上下文检查器。左侧 280px 长滚动条全部退役。
3. **延迟暴露（Progressive Disclosure）** —— 默认只露常改的；进阶项收进折叠/弹窗/设置抽屉。
4. **就近导出** —— 当前 Tab 顶部 1 个主导出按钮 + 1 个 More 菜单，覆盖 6 个尺寸。
5. **键盘第一公民** —— Cmd+1/2/3/4 切 Tab，Cmd+E 导出当前，Cmd+K 跳转字段，Cmd+Z 撤销。

---

## 3. 目标布局

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar  [Vibe ⚡]  [Overlay·Cover·Poster·Wallpaper]   ⌘K  ⤓ │   ← 56px
├──────────────────────────────────────┬──────────────────────┤
│                                      │   Inspector          │
│                                      │  ─────────────       │
│         Preview Stage                │   • 当前选中元素      │
│         （等比缩放 + 网格）           │   • 字段折叠组        │
│         [双击文字直接改]              │   • 颜色/可见/数据    │
│                                      │                      │
│                                      │   只显示与当前        │
│                                      │   选中或当前 Tab      │
│                                      │   相关的字段          │
│                                      │                      │
└──────────────────────────────────────┴──────────────────────┘
                                            300px（可折叠）
```

- **顶栏 (TopBar, 56px)**：Logo · Tab 段控件 · 主题切换 · ⌘K · 主导出按钮 + 下拉
- **主舞台 (Stage)**：当前 Tab 的 Canvas，可点选 Hot Region。选中时高亮 + 在 Inspector 显示对应字段
- **检查器 (Inspector)**：300px 抽屉，按 Tab 上下文动态切换分组；可一键收起让画布全宽

---

## 4. 关键交互改造

### 4.1 Tab 段控件迁到顶栏（取代左侧 280px 长条的 Tab 区）

- 4 个 Tab 用 segmented control，宽度统一；每个 Tab 后挂一个小角标显示该 Tab 关键字段是否改过（dirty dot）。
- 切 Tab 不重置滚动位置，因为不再有长滚动条。

### 4.2 Inspector 按 Tab 重新分组

每个 Tab 只露 **3–5 个折叠组**，默认全部展开（Claude Desktop 的"settings panel"风格）：

| Tab | 折叠组 |
|------|------|
| Overlay | Sections（活动节 + 三节内容） · Live Bar（live/stack/segments） · Visibility（Main/Camera/Sidebar/BottomBar） |
| Cover | Brand（avatar+title+subtitle） · Today's Build · Badges · Manifesto |
| Poster | Brand（与 Cover 复用） · Today's Build · Badges · Socials |
| Wallpaper | Size · Brand Label & Slogan · Visibility |

**头像 + 标题** 抽成单一 `BrandIdentityEditor`，在 Cover/Poster/Wallpaper 三个 Tab 复用同一个组件——不再"复制三份字段"。

### 4.3 预览即编辑（核心提升点）

阶段性实现：

**P1（先做）**：
- 标题、副标题、Topic、徽标 label、社交 value：双击 → 行内 contenteditable，Enter 提交，Esc 取消
- Hover 时显示淡蓝描边 + 铅笔图标

**P2（后续）**：
- 头像点击直接触发 file picker
- Sections 列表内每条 bullet 都可双击编辑、回车追加、退格删除（已经在 SidebarSectionEditor 里有，但是要从左侧搬到画布上）

**P3（可选）**：
- 拖拽徽标重排顺序

### 4.4 导出收口

```
[Export ▾]  ← 顶栏右上
  Export Current Tab as PNG          ⌘E
  ─────────────────────────────────
  Wallpaper Set (3 sizes)
  Sidebar slice
  Bottom Bar slice
  ─────────────────────────────────
  Export All (5)…
```

- 默认主按钮 = 当前 Tab 对应的 PNG
- "Export All" 按当前 state 一次出 5 张 + Wallpaper 3 张共 8 张
- 导出过程显示在按钮里（spinner + 进度），不再用底部 toast

### 4.5 ⌘K 命令面板

最小可用版本：**搜索字段名 → 跳转滚动到对应 Inspector 折叠组 + 自动展开**。
比如输入 "topic" 直接定位到 Today's Build；输入 "stack" 跳到 Live Bar。

后续可加：跳转 Section、切 Tab、切主题、触发导出。

### 4.6 Reset / 主题 / 颜色 收进设置抽屉

- 顶栏 ⚙ 图标打开 Settings 抽屉，里面放：
  - Theme（Neon / Editorial）
  - Colors（Surface / Text / Accents）
  - Reset Defaults（保留 AlertDialog）
- Inspector 不再显示色板。多数用户改主题 = 一键切预设，不需要 12 个颜色滑块常驻视野。

### 4.7 Inspector 的 Empty State

当用户在画布上没选中任何元素，Inspector 顶部显示当前 Tab 的"快速开始"入口（3–5 个最常改字段的 chip），点击直接展开对应折叠组。

---

## 5. 视觉与状态收敛

- **品牌身份字段（Avatar / Title / Subtitle / Badges）跨 Tab 共享同一份 state**，已经是这样实现的，但 UI 要明确：在 Cover Tab 的 Brand 组里改，Inspector 头部加一行小字 "shared with Poster · Wallpaper"。
- **Wallpaper 的 Title 来源** 改成"复用 Cover Title"提示，避免用户以为它独立。
- 颜色板从 11 个收成 4 个：Background / Text / Primary Accent / Secondary Accent，主题预设负责其余。

---

## 6. 落地路线（建议 4 阶段）

| 阶段 | 范围 | 风险 | 估算 |
|------|------|------|------|
| **R1: 骨架重构** | TopBar + Inspector 抽屉壳，左侧面板下线，原有字段不动地搬过去 | 中（涉及 App.tsx + EditorPanel 拆分） | 1 大块 |
| **R2: Inspector 分组 + Brand 合并** | 把 Cover/Poster Tab 的 Avatar/Title/Badges 抽成 `BrandIdentityEditor`，重排折叠组，颜色板收进 Settings 抽屉 | 低 | 1 大块 |
| **R3: Direct Manipulation P1** | 标题/副标题/Topic 双击改，Hover 描边 | 中（需要小心 contenteditable + state 同步） | 1 大块 |
| **R4: 命令面板 + 导出收口 + 快捷键** | ⌘K、⌘E、⌘1–4，导出菜单合并 | 低 | 1 大块 |

每阶段独立可发布，建议每个阶段一个 PR / commit chunk。

---

## 7. 与现有代码的衔接

- 拆分目标：`EditorPanel.tsx` 1095 行 → 多个 ~150–250 行的折叠组组件 + 一个 200 行内的 `Inspector.tsx` 容器
- Tab 切换、Reset、Theme、Colors 这些已成熟，只搬位置不改逻辑
- 新增组件清单（建议）：
  - `TopBar.tsx`（含 TabSegment、ExportMenu、SettingsButton、CmdKTrigger）
  - `Inspector.tsx`（容器 + 折叠组协议）
  - `inspector/BrandIdentityGroup.tsx`（avatar+title+subtitle+badges 复用版）
  - `inspector/SectionsGroup.tsx`（活动节 + 三节）
  - `inspector/LiveBarGroup.tsx`（Live Session + Stack + 3 段）
  - `inspector/TodaysBuildGroup.tsx`
  - `inspector/WallpaperGroup.tsx`
  - `inspector/VisibilityGroup.tsx`
  - `CommandPalette.tsx`
  - `SettingsDrawer.tsx`
- 现有的 `BadgesEditor / SocialsEditor / SidebarSectionEditor / BottomBarSegmentEditor / LiveSessionEditor / StackEditor / WallpaperEditor` 全部保留，只换包裹外壳

---

## 8. 待确认

1. **R1 是否只做 UI 容器换皮（左 → 右 + 顶栏），保留所有现有编辑器组件不动？** 推荐先这样跑通。
2. **预览即编辑 (P1) 的优先级**：要先做 R3 的双击改文字，还是先做 R4 的命令面板/快捷键？我倾向 R3，因为它带来的"易用感"提升最直接。
3. **是否保留左侧 280px 面板作为可选模式（高级模式）？** 我倾向不保留——双面板会再次走回老路。

确认后即可按 R1 起步动手。
