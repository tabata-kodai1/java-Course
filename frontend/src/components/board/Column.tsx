import type { ColumnResponse } from '../../api/types';
import { Card } from './Card';
import { CardCreateForm } from './CardCreateForm';

interface ColumnProps {
  column: ColumnResponse;
  onCardCreated: () => void;
}

export function Column({ column, onCardCreated }: ColumnProps) {
  const sortedCards = [...column.cards].sort((a, b) => a.position - b.position);

  return (
    <section className="column">
      <div className="column-header">
        <div className="column-title">{column.title}</div>
      </div>
      <div className="card-list">
        {sortedCards.length === 0 ? (
          <p className="card-list-empty">該当するカードがありません</p>
        ) : (
          sortedCards.map((card) => <Card key={card.id} card={card} />)
        )}
      </div>
      <CardCreateForm columnId={column.id} onCreated={onCardCreated} />
    </section>
  );
}
