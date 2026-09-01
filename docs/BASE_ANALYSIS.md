# PulseX Base Analysis（TASK-001）

> 只分析底座，不修改原 PHP 业务代码。  
> 底座：ZenTao PMS **22.0**（禅道开源版）  
> 分析日期：2026-09-01  
> 作者：yanhuaichuan

---

## 1. 目录结构

```text
PulseXTeam/                    # 当前仓库根（二次开发起点）
├── framework/                 # 自研 PHP MVC（router / control / model / helper）
├── module/                    # 业务模块（约 100+）
│   ├── control.php            # 控制器
│   ├── model.php              # 数据与业务
│   ├── zen.php                # 新架构层（部分模块）
│   ├── tao.php                # 业务扩展层（部分模块）
│   ├── view/                  # 传统 PHP 模板
│   ├── ui/                    # 新 UI 组件（PHP 渲染）
│   ├── js/  css/  lang/
├── lib/                       # 第三方库 + DAO + ZUI 服务端组件
├── config/                    # 全局配置（my.php 不入库）
├── www/                       # Web 入口与静态资源
│   ├── index.php              # 主路由
│   ├── api.php                # REST API 入口
│   └── js/                    # jQuery + ZUI，无现代 React 工程
├── db/                        # zentao.sql + 版本化 update*.sql
├── extension/                 # 插件（钉钉/喧喧等）
├── test/                      # 自研测试框架
└── apps/  packages/           # PulseX 新增（Strangler 层，见 ARCHITECTURE.md）
```

结论：底座是 **PHP MVC + 服务端渲染**，不是 Webpack/React SPA。所谓「旧 React」在本仓库中并不存在；前端是 **ZUI + jQuery + PHP view/ui**。

---

## 2. 数据库

- 引擎：MySQL / MariaDB（另有 pgsql / dm 实验脚本）
- 前缀：`zt_`
- 主 schema：`db/zentao.sql`，增量：`db/update*.sql`
- DAO：`lib/dao/`

### 核心表（Base Domain，必须保留）

| 领域 | 表 | 说明 |
|---|---|---|
| 组织 | `zt_user` `zt_group` `zt_groupPriv` `zt_userGroup` `zt_dept` `zt_company` | 账号、RBAC |
| 项目集 | `zt_project`（type=program/project/sprint） | 项目集/项目/执行共用表 |
| 产品 | `zt_product` `zt_story` `zt_productplan` | 需求 |
| 任务 | `zt_task` `zt_taskEstimate` `zt_team` | wait/doing/done |
| 看板 | `zt_kanban*` | 独立看板空间 |
| Bug | `zt_bug` | active/resolved/closed |
| 测试 | `zt_case` `zt_testtask` `zt_testsuite` `zt_testresult` | QA |
| 知识库 | `zt_doc` `zt_doclib` `zt_doccontent` | Wiki |
| 发布 | `zt_release` `zt_build` | 版本 |
| 动态 | `zt_action` `zt_history` | Activity |
| 通知 | `zt_webhook` `zt_notify` `zt_mailqueue` | 钉钉/飞书/企微 |
| 风险 | `zt_risk`（Max/部分版本） | 底座已有风险概念 |

### 任务表演化

`db/init.sql` 早期 `zt_task` 仅有 `wait/doing/done/cancel`。  
现行版本字段更完整（`assignedTo`、`parent`、`mode`、`closed`、`blocked` 相关通过 status/reason 表达）。

### 迁移约束

- 禁止一次性改表结构
- PulseX 新表走 `px_*` 前缀（Health、Risk Engine、Activity 扩展、Automation）
- 读写经 Adapter，Phase 1 只读 legacy

---

## 3. API

入口：`www/api.php`  
路由：`config/apiv1.php`、`config/apiv2.php`

### 已覆盖的 REST 资源

```text
/tokens                      认证
/projects  /programs         项目 / 项目集
/executions                  执行 / 迭代
/tasks                       任务（start/finish/pause/assign）
/bugs                        Bug（confirm/resolve）
/stories                     需求
/testcases / testsuites / testtasks
/docs / doclibs              知识库
/releases / builds
/users / departments / groups
/risks                       风险（部分版本）
/webhooks                    通知
```

认证：Token（`/tokens`）+ 传统 Session。  
响应：禅道自定义 JSON，**不是** `{ success, data }`。

PulseX Gateway 必须做 **Response Adapter**。

---

## 4. 权限

模型：`group + groupPriv(module, method) + userGroup`

- 粒度：模块方法级（`task-create`、`bug-resolve`）
- 视野：产品/项目/执行白名单（`manageView`）
- 内置分组：管理员、研发、测试、项目经理、产品经理、访客 等

PulseX RBAC 映射：

| PulseX Role | 底座近似 |
|---|---|
| Owner | 超级管理员 / 公司管理员 |
| Admin | 管理员 |
| Manager | 项目经理 |
| Developer | 研发 |
| Tester | 测试 |
| Member | 团队成员 |
| Viewer | 访客 / 受限 |

迁移期：`Legacy Auth → Auth Adapter → JWT`。

---

## 5. 项目

模块：`module/project`、`module/program`、`module/execution`、`module/product`

- `program`：项目集
- `project`：项目（scrum / waterfall / kanban）
- `execution`：迭代 / 执行（底座把 sprint 落在 execution）
- 成员：`zt_team`

PulseX `Project Service` 第一阶段映射：

```text
Program  → Workspace / Project Group
Project  → Project
Execution → Sprint
```

---

## 6. 任务

模块：`module/task`、`module/kanban`、`module/execution`（taskkanban）

状态：`wait | doing | done | pause | cancel | closed`  
类型：devel / test / design / affair / study …  
支持子任务、工时、指派、看板卡片。

底座 **没有一等 Blocked 字段**。PulseX 需新增：

```text
px_task_block  (task_id, blocked_by, reason)
```

通过 Adapter 计算 Sprint / Project Risk。

---

## 7. Bug

模块：`module/bug`

状态：`active | resolved | closed`  
严重程度：`severity` 1–4  
优先级：`pri`  
关联：product / project / story / task / build

---

## 8. 测试

模块：`module/testcase` `testsuite` `testtask` `testreport` `qa` `caselib`

链路：用例 → 套件 → 测试单 → 结果 → 报告。  
结果：`pass | fail | blocked | n/a`。

---

## 9. 知识库

模块：`module/doc`

- 文档库 `doclib`（项目 / 产品 / 自定义）
- 文档 `doc` + 内容版本 `doccontent`
- 无 ADR / Runbook / FAQ 类型。PulseX 用 `kind` 扩展。

搜索：MySQL 字段检索，无向量。第一阶段保持全文检索。

---

## 10. 钉钉

模块：`module/webhook` + `lib/dingapi`

类型：

- `dinggroup` 群机器人 Webhook
- `dinguser` 工作通知（AgentId / AppKey / AppSecret）

同时支持企微、飞书。业务代码直接拼钉钉 payload。

PulseX 必须：`NotificationAdapter`，业务层禁止直接调用钉钉 API。

---

## 11. 前端路由

传统：`www/index.php` → `moduleName-methodName-params.html`

```text
index.php?m=project&f=browse
index.php?m=task&f=create&executionID=1
index.php?m=bug&f=view&bugID=12
```

PATH_INFO：`/project-browse-*.html`

无 React Router。PulseX Web 使用独立 SPA 路由，不复用 PHP 页面。

---

## 12. Webpack

**不存在项目级 Webpack / Vite / package.json 工程。**

静态资源：

- `www/js/jquery/`
- `www/js/zui*`（ZUI 2/3）
- `www/theme/`
- 少量 `www/js/vue/`（antd.min.js 等第三方包，非自研 React 应用）

构建：`misc/minifyfront.php` 压缩已有 JS/CSS。

结论：前端迁移不是 Webpack→Vite，而是 **SSR PHP UI → React 19 SPA 重建**。

---

## 13. React

底座前端不是 React 应用。

存在：

- PHP `view/*.html.php` + `ui/*.html.php`
- jQuery 事件
- ZUI 组件（DTable / Modal / Picker）

PulseX 全面使用 Function Component + Hooks，禁止 Class Component。

---

## 14. 底座能力（Base Domain，保留）

```text
项目集  项目  任务  看板  迭代  测试用例  Bug  知识库  钉钉通知
```

这些是业务资产，不是要推翻的代码。

---

## 15. 缺口（PulseX 要补）

| 能力 | 底座 | PulseX |
|---|---|---|
| 实时同步 | 轮询 / 刷新 | WebSocket + Domain Event |
| 项目脉搏 | 报表模块 | Health Score + Pulse UI |
| 阻塞 | 弱 | Blocked + Risk Engine |
| AI | 实验模块 `ai` | AI Service（Tool/Permission 隔离） |
| 自动化 | Cron + Webhook | Trigger → Condition → Action |
| 统一 API | 禅道 JSON | `{ success, data }` |
| 现代前端 | ZUI/jQuery | React 19 + @pulsex/ui |

---

## 16. 迁移顺序（已确认）

```text
1. Authentication
2. Project
3. Member
4. Task
5. Sprint
6. Bug
7. Test
8. Knowledge
9. Notification
10. Release
```

禁止先迁 Task 而不做 Auth。禁止一次性重写 PHP。禁止删除原库。
