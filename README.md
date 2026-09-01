# PulseX

> **Feel the pulse. Ship with confidence.**
>
> 看见项目脉搏，掌控研发节奏。

**Open-source Engineering Workspace** · 开源研发工作空间  
作者 [yanhuaichuan](https://github.com/yanhuaichuan) · Repository [PulseXTeam](https://github.com/yanhuaichuan/PulseXTeam)

[![Node](https://img.shields.io/badge/Node.js-22+-3c9a5f)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-4da8f7)](https://react.dev)
[![License](https://img.shields.io/badge/PulseX-Apache--2.0-8b93a0)](./LICENSE)

---

```text
PROJECT PULSE                         84
████████████████░░░

12 Projects    47 Active Tasks    8 Risks
3 Blockers     17 Bugs            91% Test Pass
```

### ⚡ Realtime

所有变化实时同步。Task、Bug、Sprint、Release 不再靠刷新。

### 🤖 AI-native

AI 不只是聊天，而是分析研发过程：项目摘要、周报、Sprint Review、Release Notes。

### 🧠 Engineering Intelligence

项目健康、风险、质量自动计算。问的不是「任务在哪」，而是「项目现在怎么样」。

### 🔗 Fully Connected

Requirement → Task → Bug → Test → Release，点击任意对象查看它影响了什么。

### 🔔 Automation

一个事件触发一整套动作。P0 Bug → 创建风险 → 钉钉通知 → 告知项目经理。

### 🏠 Self-hosted

数据掌握在自己手里。

---

## 产品定位

PulseX 不是 Jira Clone，也不是把旧项目管理系统换一层 React。

> **PulseX 把项目管理、研发协作、测试质量、实时事件、AI 分析与自动化连接成一个开源 Engineering Workspace。**

中文名：**脉动**。

| 传统系统 | PulseX |
|---|---|
| 任务在哪里？ | 项目现在怎么样？ |
| Bug 有多少？ | Bug 会不会影响 Release？ |
| 任务完成了吗？ | Sprint 为什么延期？ |
| 项目经理写周报 | AI 自动总结研发过程 |
| 刷新页面才看到变化 | 实时看见项目脉搏 |

---

## 快速开始

```bash
pnpm install
cp .env.example .env

# 终端 1：API Gateway（含 Auth / Project / Task / QA / AI / DingTalk / WebSocket）
pnpm dev:api

# 终端 2：前端
pnpm dev:web
```

打开 [http://localhost:5180](http://localhost:5180)

```text
账号  yanhuaichuan
密码  pulsex
```

Docker：

```bash
docker compose up -d
```

---

## 架构（Strangler Migration）

底座是成熟的研发管理系统（项目集、项目、任务、看板、迭代、用例、Bug、知识库、钉钉）。  
PulseX **不一次性重写 PHP，也不删除原库**。Node 服务通过 Adapter 逐步切流。

```text
Browser ── HTTP / WebSocket ── API Gateway
                                  │
                Project · Task · QA · Knowledge
                Notification · AI · Realtime
                                  │
                            Legacy PHP  ↔  MySQL
```

第一阶段服务边界：Gateway、Project、Task、QA、Realtime、Notification、AI。  
不为了拆而拆，避免 Microservice Hell。

详情见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 与 [docs/BASE_ANALYSIS.md](docs/BASE_ANALYSIS.md)。

---

## 技术栈

| 层 | 选择 |
|---|---|
| 前端 | React 19 · TypeScript · Vite · pnpm · Turborepo |
| UI | `@pulsex/ui` · Teambition 冷调协作风 |
| 后端 | Node.js 22 · TypeScript · Koa（Egg 风格中间件） |
| 实时 | WebSocket Gateway · Domain Event · Redis Streams（可演进） |
| 数据 | MySQL 事务库（第一阶段不替换） |
| 通知 | NotificationAdapter（钉钉 / Webhook / Email） |

---

## 界面原则

- 大面积纯白，次要面板极浅冷灰
- 浅亮天蓝只用于按钮、选中、高亮
- 任务卡片白底、细浅灰边、几乎无阴影；优先级靠左侧细彩条
- 线性细线图标；小中圆角；信息优先

---

## 许可

- **PulseX 新增代码**（`apps/`、`packages/`、`docs/`、`deploy/`）：[Apache-2.0](./LICENSE)，© yanhuaichuan
- **底座 PHP 业务代码**（`module/`、`framework/`、`www/` 等）：仍遵循原项目 [ZPL / AGPL](./COPYING)

---

## 开发路线

```text
Legacy System → PulseX Foundation → Modern React UI
→ Node Services → Realtime → Pulse Dashboard → AI → Automation
→ Engineering Intelligence
```

最终目标：让 PulseX 从一个项目管理工具，变成一个真正的研发操作系统。
