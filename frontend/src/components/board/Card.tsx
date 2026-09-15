import { useState, type DragEvent } from 'react';
import type { CardResponse } from '../../api/types';
import { CardEditForm } from './CardEditForm';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

interface CardProps {
  card: CardResponse;
  onUpdated: () => void;
}

export function Card({ card, onUpdated }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const priorityKey = card.priority ?? 'medium';
  const priorityLabel = PRIORITY_LABEL[priorityKey] ?? priorityKey;

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div
        className="card"
        data-card-id={card.id}
        draggable
        onDragStart={handleDragStart}
        onClick={() => setIsEditing(true)}
      >
        <p className="card-title">{card.title}</p>
        <div className="card-meta">
          <span className={`priority-badge priority-${priorityKey}`}>{priorityLabel}</span>
          {card.dueDate && <span className="card-due">期日: {card.dueDate}</span>}
        </div>
      </div>
      {isEditing && (
        <CardEditForm card={card} onClose={() => setIsEditing(false)} onUpdated={onUpdated} />
      )}
    </>
  );
}
