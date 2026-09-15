import { useRef, useState, type DragEvent } from 'react';
import { moveCard, sortColumnByDueDate, sortColumnByPriority } from '../../api/cards';
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
  const [isBusy, setIsBusy] = useState(false);

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

  const handleSortByDueDate = async () => {
    if (sortedCards.length < 2 || isBusy) return;
    setIsBusy(true);
    try {
      await sortColumnByDueDate(column.id);
      onCardUpdated();
    } catch (err) {
      console.error('期限順の並び替えに失敗しました', err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSortByPriority = async () => {
    if (sortedCards.length < 2 || isBusy) return;
    setIsBusy(true);
    try {
      await sortColumnByPriority(column.id);
      onCardUpdated();
    } catch (err) {
      console.error('優先度順の並び替えに失敗しました', err);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="column">
      <div className="column-header">
        <div className="column-title">{column.title}</div>
        <div className="column-actions">
          <button
            type="button"
            className="column-sort-button"
            disabled={sortedCards.length < 2 || isBusy}
            onClick={handleSortByDueDate}
            title="このカラムのカードを期限の早い順に並び替え"
          >
            期限順
          </button>
          <button
            type="button"
            className="column-sort-button"
            disabled={sortedCards.length < 2 || isBusy}
            onClick={handleSortByPriority}
            title="このカラムのカードを優先度の低い順に並び替え"
          >
            優先度順
          </button>
        </div>
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
