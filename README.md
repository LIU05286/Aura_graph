# Aura Graph

一个纯前端、本地优先的 3D 记忆星图。本仓库是从单文件原型拆分而来的 Vite + React + TypeScript 工程版,渲染层仍为原生 three.js(尚未迁移到 React Three Fiber)。

## 运行

```bash
npm install
npm run dev      # 启动开发服务器(默认 http://localhost:5173)
npm run build    # tsc 类型检查 + 生产构建
npm run preview  # 预览构建产物
```

## 目录结构

```
src/
  types/graph.ts           # 领域类型(MemoryNode / MemoryEdge / AuraGraph)
  data/
    seedGraph.ts           # 内置示例数据
    visualMappings.ts      # 类型→颜色/中文名,重要度→尺寸/辉光
  store/graphStore.ts      # Zustand 全局状态与 actions
  utils/
    graphSearch.ts         # 搜索
    graphFilter.ts         # 可见节点计算 + 标签收集
    graphRelations.ts      # 关联节点查找
    graphLayout.ts         # 坐标读取(为下一轮 d3-force 预留)
  components/
    layout/AppShell.tsx    # 组合画布与面板
    graph/
      GraphCanvas.tsx      # store → StarMap props 适配器
      StarMap.tsx          # 原生 three.js 渲染层(纯 props,不依赖 store)
    panels/                # ControlPanel / Search / TypeFilter / TagFilter / Detail
    ui/                    # TypeDot / Stars / Chip
  styles/                  # global.css / auraGraph.css
```

## 功能

旋转 / 缩放 / 点击选中 / 搜索定位并飞向 / 类型筛选 / 星座(标签)筛选 / 详情面板与关联跳转。本轮不含新建、编辑、删除节点与自动布局。
