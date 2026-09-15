import { useState, type DragEvent, type MouseEvent } from 'react';
import type { CardResponse } from '../../api/types';
import { CardEditForm } from './CardEditForm';
import { deleteCard } from '../../api/cards';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

interface CardProps {
  card: CardResponse;
  onUpdated: () => void;
  isSelected: boolean;
  onToggleSelect: (cardId: number) => void;
}

export function Card({ card, onUpdated, isSelected, onToggleSelect }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const priorityKey = card.priority ?? 'medium';
  const priorityLabel = PRIORITY_LABEL[priorityKey] ?? priorityKey;

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await deleteCard(card.id);
      onUpdated();
    } catch (err) {
      console.error('カードの削除に失敗しました', err);
    }
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
        <input
          type="checkbox"
          className="card-select-checkbox"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleSelect(card.id)}
          aria-label="カードを選択"
        />
        <button
          type="button"
          className="card-delete-button"
          onClick={handleDelete}
          aria-label="カードを削除"
        >
          ×
        </button>
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
