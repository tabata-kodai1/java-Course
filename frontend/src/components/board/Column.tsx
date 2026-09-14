import type { ColumnResponse } from '../../api/types';
import { Card } from './Card';

interface ColumnProps {
  column: ColumnResponse;
}

export function Column({ column }: ColumnProps) {
  const sortedCards = [...column.cards].sort((a, b) => a.position - b.position);

  return (
    <section className="column">
      <div className="column-header">
        <div className="column-title">{column.title}</div>
      </div>
      <div className="card-list">
        {sortedCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
