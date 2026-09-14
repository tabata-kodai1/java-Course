import type { CardResponse } from '../../api/types';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

interface CardProps {
  card: CardResponse;
}

export function Card({ card }: CardProps) {
  const priorityKey = card.priority ?? 'medium';
  const priorityLabel = PRIORITY_LABEL[priorityKey] ?? priorityKey;

  return (
    <div className="card">
      <p className="card-title">{card.title}</p>
      <div className="card-meta">
        <span className={`priority-badge priority-${priorityKey}`}>{priorityLabel}</span>
        {card.dueDate && <span className="card-due">期日: {card.dueDate}</span>}
      </div>
    </div>
  );
}
