import type { Task } from '@pulsex/types';
import { Avatar, Badge } from '@pulsex/ui';

const users: Record<string, string> = {
  user_1: 'yanhuaichuan',
  user_2: '张三',
  user_3: '李四',
  user_4: '王五'
};

export function TaskCard({
  task,
  onOpen,
  onDragStart
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onDragStart?: (task: Task) => void;
}) {
  return (
    <article
      className={`task-card${task.status === 'done' || task.status === 'closed' ? ' done' : ''}`}
      draggable
      onDragStart={() => onDragStart?.(task)}
      onClick={() => onOpen(task)}
    >
      <span className={`pri ${task.priority}`} />
      <div className="title">{task.title}</div>
      <div className="meta">
        <div className="tags">
          <Badge>{task.key}</Badge>
          {task.tags?.slice(0, 1).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {task.dueDate ? task.dueDate.slice(5) : ''}
          {task.assigneeId ? <Avatar name={users[task.assigneeId] ?? 'U'} size={20} /> : null}
        </span>
      </div>
    </article>
  );
}
