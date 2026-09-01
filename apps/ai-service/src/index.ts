import { config } from '@pulsex/config';
import { Router, authMiddleware } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';
import type { AIProvider, ChatRequest, ChatResponse } from '@pulsex/types';

class CompatibleProvider implements AIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!config.ai.apiKey || !config.ai.baseUrl) {
      return {
        provider: 'local-template',
        model: 'pulsex-rules',
        content: request.messages.at(-1)?.content ?? ''
      };
    }
    const response = await fetch(`${config.ai.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.ai.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: request.messages
      })
    });
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return {
      provider: config.ai.provider,
      model: config.ai.model,
      content: json.choices?.[0]?.message?.content ?? ''
    };
  }
}

const provider: AIProvider = new CompatibleProvider();

function localProjectSummary(projectId: string) {
  const pulse = store.pulse(projectId);
  const openRisks = store.risks.filter((item) => item.projectId === projectId && item.status !== 'closed');
  const blockers = store.tasks.filter((item) => item.projectId === projectId && item.status === 'blocked');
  const p0 = store.bugs.filter((item) => item.projectId === projectId && item.priority === 'p0' && item.status === 'active');
  const lines = [
    '我发现几个值得关注的问题：',
    ...blockers.map((item) => `🔴 ${item.title}（${item.key} 已阻塞）`),
    ...openRisks.filter((item) => item.severity !== 'critical').map((item) => `🟡 ${item.title}`),
    ...p0.map((item) => `🟡 ${item.key} 可能影响本周 Release`),
    '',
    `项目健康度 ${pulse.health}，测试通过率 ${pulse.testPassRate}%，进行中任务 ${pulse.activeTasks}。`
  ];
  return lines.join('\n');
}

function localWeekly(projectId: string) {
  const pulse = store.pulse(projectId);
  const completed = store.tasks.filter((item) => item.projectId === projectId && item.status === 'done').length;
  const bugsFixed = store.bugs.filter((item) => item.projectId === projectId && item.status !== 'active').length;
  return [
    '本周研发总结',
    '',
    `完成任务：${completed}`,
    `修复 Bug：${bugsFixed}`,
    `测试通过率：${pulse.testPassRate}%`,
    `项目健康度：${pulse.health}`,
    `主要风险：${pulse.risks}`,
    '',
    '下周建议：先解除 Payment API 阻塞，再冻结 Release 范围，避免 P0 Bug 带入 v2.1.0。'
  ].join('\n');
}

function localSprint(projectId: string) {
  const sprint = store.sprints.find((item) => item.projectId === projectId);
  if (!sprint) return '当前项目没有进行中的 Sprint。';
  return [
    `AI Sprint Review · ${sprint.name}`,
    '',
    `Planned ${sprint.planned} · Completed ${sprint.completed} · Carry Over ${sprint.carryOver}`,
    '',
    '本次 Sprint 最大问题：',
    '1. 需求变更导致看板范围抖动',
    '2. 测试资源不足，TEST-183 仍失败',
    '3. Payment API 延迟，阻塞 TASK-182'
  ].join('\n');
}

function localReleaseNotes(projectId: string) {
  const done = store.tasks.filter((item) => item.projectId === projectId && item.status === 'done');
  const fixes = store.bugs.filter((item) => item.projectId === projectId && item.status !== 'active');
  return [
    '✨ Features',
    ...done.map((item) => `- ${item.title}`),
    '',
    '🐛 Bug Fixes',
    ...fixes.map((item) => `- ${item.title}`),
    '',
    '⚡ Performance',
    '- 看板状态变更通过 Event Bus 实时同步',
    '',
    '⚠ Breaking Changes',
    '- 无'
  ].join('\n');
}

export function aiRouter() {
  const router = new Router({ prefix: '/api/v1/ai' });
  router.use(authMiddleware());

  router.get('/summary', async (ctx) => {
    const projectId = String(ctx.query.projectId ?? '1001');
    const local = localProjectSummary(projectId);
    const result = await provider.chat({
      messages: [
        { role: 'system', content: 'You are PulseX AI Project Manager. Reply in Chinese. Do not access databases.' },
        { role: 'user', content: local }
      ]
    });
    ctx.body = ok({
      kind: 'project-summary',
      content: result.provider === 'local-template' ? local : result.content,
      previewOnly: true,
      provider: result.provider
    });
  });

  router.get('/weekly', async (ctx) => {
    const projectId = String(ctx.query.projectId ?? '1001');
    ctx.body = ok({ kind: 'weekly', content: localWeekly(projectId), previewOnly: true });
  });

  router.get('/sprint', async (ctx) => {
    const projectId = String(ctx.query.projectId ?? '1001');
    ctx.body = ok({ kind: 'sprint', content: localSprint(projectId), previewOnly: true });
  });

  router.get('/release-notes', async (ctx) => {
    const projectId = String(ctx.query.projectId ?? '1001');
    ctx.body = ok({ kind: 'release-notes', content: localReleaseNotes(projectId), previewOnly: true });
  });

  return router;
}
