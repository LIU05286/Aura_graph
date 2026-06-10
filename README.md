# Aura Graph · 记忆星图

一个纯前端、本地优先的 3D 知识图谱可视化工具。把你的记忆、笔记、概念和项目组织成可旋转、可探索的星空宇宙。

技术栈: **Vite + React 18 + TypeScript + React Three Fiber + three.js + Zustand + Dexie + d3-force-3d**。

## ✨ 功能

- **3D 星图渲染** — 节点以发光球体悬浮在深空背景中,星尘粒子环绕,连线用半透明线段表示关系。
- **交互浏览** — 拖拽旋转、滚轮缩放、点击选中节点;空闲时相机自动绕 Y 轴缓慢旋转。
- **搜索定位** — 按标题或内容搜索记忆,点击结果后相机平滑飞向目标节点。
- **类型筛选** — 8 种节点类型(想法 / 笔记 / 人物 / 项目 / 书籍 / 课程 / 事件 / 概念),可单独开启/关闭。
- **星座(标签)筛选** — 按标签聚焦节点群,多选叠加,空集表示不筛选。
- **详情与关联** — 右侧面板展示节点内容、重要度星级、所属星座、关联节点(可点击跳转)及所有关系。
- **CRUD 节点** — 通过「+ 新建节点」或详情面板的「编辑」按钮打开模态表单,创建 / 编辑 / 删除节点。
- **关系管理** — 在详情面板中选择目标节点和关系类型,添加新的连线;单条关系可删除。
- **力导布局** — 基于 d3-force-3d 的 300 次迭代同步布局,可对当前图谱一键重新排布。
- **导入 / 导出** — 将图谱导出为 JSON 文件,或从 JSON 文件导入替换当前图谱。
- **重置示例** — 一键恢复到内置的「个人记忆宇宙」示例数据(数学 / 物理 / 方法论三个星团)。
- **本地持久化** — 基于 IndexedDB (Dexie) 自动保存,刷新页面后图谱不丢失。

## 🚀 运行

```bash
npm install
npm run dev       # 启动开发服务器 (默认 http://localhost:5173)
npm run build     # tsc 类型检查 + Vite 生产构建
npm run preview   # 预览构建产物
```

## 🧱 技术架构

```
Vite (bundler)
├── React 18 + TypeScript (UI 层)
├── React Three Fiber / drei + three.js (3D 渲染层)
├── Zustand (全局状态管理)
├── Dexie / IndexedDB (本地持久化)
└── d3-force-3d (力导向布局)
```

- **渲染层隔离**: `StarScene` 是纯 props 组件,不依赖 Zustand store,由 `GraphCanvas` 适配 store → props。便于独立测试和未来换渲染方案。
- **单一数据源**: 视觉映射(类型颜色 / 标签名 / 尺寸规则)集中在 `visualMappings.ts`,组件禁止硬编码色值。
- **领域类型**: 全域共享 `types/graph.ts` 中的 `MemoryNode` / `MemoryEdge` / `AuraGraph` 类型。

## 📁 目录结构

```text
src/
  types/
    graph.ts               # 领域类型定义 (MemoryNode / MemoryEdge / AuraGraph)
    d3-force-3d.d.ts       # d3-force-3d 类型声明
  data/
    seedGraph.ts           # 内置示例图谱 (17 节点 + 19 条边)
    visualMappings.ts      # 类型 → 颜色 / 中文名 / 重要度 → 尺寸辉光 / 边配色
    db.ts                  # Dexie IndexedDB 实例
    graphRepository.ts     # graph 读写仓储 (load / save)
  store/
    graphStore.ts          # Zustand 全局状态与 actions (含 CRUD / 筛选 / 飞向等)
  hooks/
    usePersistence.ts      # 自动加载与防抖持久化 (400ms)
  utils/
    graphSearch.ts         # 搜索 (标题+内容子串匹配)
    graphFilter.ts         # 可见节点计算 + 标签收集
    graphRelations.ts      # 关联节点查询 / 关联边查询
    graphLayout.ts         # d3-force-3d 力导向布局计算
    graphIO.ts             # JSON 导出 / 导入解析
  components/
    layout/
      AppShell.tsx         # 应用骨架,组合画布 + 控制面板 + 详情面板 + 模态表单
    graph/
      GraphCanvas.tsx      # store → StarScene props 适配器
      scene/
        StarScene.tsx      # R3F Canvas 总入口 (相机 / 星空 / 节点 / 连线 / OrbitControls)
        CameraRig.tsx      # 飞向动画 + 空闲自转
        Nodes.tsx          # 节点渲染 (球体 + 辉光 + Html 标签 + 悬停/选中/暗淡)
        Edges.tsx          # 边渲染 (bufferGeometry + AdditiveBlending 连线)
        NodeGlow.tsx       # 节点辉光 Sprite
        glowTexture.ts     # 辉光纹理生成
    panels/
      ControlPanel.tsx     # 左侧面板 (品牌 / 新建 / 布局 / 搜索 / 筛选 / IO / 状态)
      SearchPanel.tsx      # 搜索框 + 结果列表
      TypeFilterPanel.tsx  # 类型开关筛选
      TagFilterPanel.tsx   # 星座标签筛选
      DetailPanel.tsx      # 右侧详情 (内容 / 关联 / 关系管理 / 编辑 / 删除)
      GraphIOPanel.tsx     # 导入导出 + 重置
      NodeFormModal.tsx    # 新建 / 编辑节点模态表单
    ui/
      TypeDot.tsx          # 类型色点
      Stars.tsx            # 重要度星级
      Chip.tsx             # 标签/按钮通用 Chip
  styles/
    global.css             # 全局样式 (深色背景 / 字体)
    auraGraph.css          # 面板 / 标签 / 模态 / 详情等组件样式
index.html                 # HTML 入口
```

## 📦 依赖

| 依赖 | 用途 |
|------|------|
| `react` / `react-dom` | UI 框架 |
| `@react-three/fiber` | React 到 three.js 的声明式适配 |
| `@react-three/drei` | R3F 常用工具 (OrbitControls, Stars, Html) |
| `three` | 3D 渲染引擎 |
| `zustand` | 轻量全局状态管理 |
| `d3-force-3d` | 力导向布局算法 |
| `dexie` | IndexedDB 封装,本地持久化 |
| `typescript` | 类型检查 |
| `vite` | 构建工具 |

## 🔮 数据模型

```typescript
// 节点类型: idea | note | person | project | book | course | event | concept
// 边类型:   related | causes | supports | contradicts | source | similar | extends
// 重要度:   1 (最弱) ~ 5 (最强)

interface MemoryNode {
  id: string;           // UUID
  title: string;        // 标题
  content: string;      // 正文
  type: MemoryNodeType; // 类型
  tags: string[];       // 星座标签
  importance: 1|2|3|4|5;
  x, y, z: number;     // 3D 坐标
  color?: string;       // 可选覆盖色
  size?: number;        // 可选覆盖尺寸
}

interface MemoryEdge {
  id: string;
  source: string;       // 源节点 id
  target: string;       // 目标节点 id
  type: MemoryEdgeType; // 关系类型
  strength: 1|2|3|4|5;  // 关系强度
  label?: string;
}
```

## 📄 许可

MIT
