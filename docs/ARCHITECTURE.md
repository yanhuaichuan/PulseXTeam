# PulseX Architecture

> Open-source Engineering Workspace  
> Author: yanhuaichuan

## Strangler Migration

```text
                 PulseX Frontend (React 19)
                       │
                       ▼
                  API Gateway
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       Node          Node          Node
       Task          Project       QA
          │            │             │
          └────────────┼─────────────┘
                       │
                 Legacy PHP
                  ↕
                MySQL
```

PHP 模块按「Adapter → Dual Write → Cutover → Remove」替换。第一阶段 Node 服务通过 Adapter 读底座数据；无数据库时使用内置演示数据，保证 `pnpm dev` 可独立运行。

## 第一阶段服务边界

只拆：

```text
Gateway · Project · Task · QA · Realtime · Notification · AI
```

不拆 Task Subtask / Bug / Priority 微服务。

## 实时

业务服务只发 Domain Event。WebSocket 只存在于 Realtime Service。

```text
Client → WS Gateway → Event Bus (Redis Streams / Memory)
```

## AI

```text
AI → Tool / Service → Permission → Business Service → Database
```

写操作必须 Preview + Confirm + Audit。

## 通知

```text
NotificationAdapter
  ├── DingTalk
  ├── Webhook
  ├── Email
  └── Feishu (future)
```

业务层禁止直接调用钉钉 API。
