import { useRef, type DragEvent } from 'react';
import { moveCard } from '../../api/cards';
import type { ColumnResponse } from '../../api/types';
import { Card } from './Card';
import { CardCreateForm } from './CardCreateForm';

interface ColumnProps {
  column: ColumnResponse;
  onCardCreated: () => void;
  onCardUpdated: () => void;
}

export function Column({ column, onCardCreated, onCardUpdated }: ColumnProps) {
  const sortedCards = [...column.cards].sort((a, b) => a.position - b.position);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;

    let cardId: number;
    try {
      ({ cardId } = JSON.parse(raw) as { cardId: number });
    } catch {
      return;
    }

    let dropIndex = sortedCards.length;
    const cardEls = listRef.current?.querySelectorAll<HTMLElement>('[data-card-id]');
    if (cardEls) {
      for (let i = 0; i < cardEls.length; i++) {
        const rect = cardEls[i].getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (e.clientY < midpoint) {
          dropIndex = i;
          break;
        }
      }
    }

    try {
      await moveCard(cardId, { columnId: column.id, position: dropIndex });
      onCardUpdated();
    } catch (err) {
      console.error('カードの移動に失敗しました', err);
    }
  };

  return (
    <section className="column">
      <div className="column-header">
        <div className="column-title">{column.title}</div>
      </div>
      <div className="card-list" ref={listRef} onDragOver={handleDragOver} onDrop={handleDrop}>
        {sortedCards.length === 0 ? (
          <p className="card-list-empty">該当するカードがありません</p>
        ) : (
          sortedCards.map((card) => <Card key={card.id} card={card} onUpdated={onCardUpdated} />)
        )}
      </div>
      <CardCreateForm columnId={column.id} onCreated={onCardCreated} />
    </section>
  );
}
