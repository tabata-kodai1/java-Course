import type { ColumnResponse } from '../../api/types';
import { Column } from './Column';

interface BoardProps {
  columns: ColumnResponse[];
  onCardCreated: () => void;
  onCardUpdated: () => void;
}

export function Board({ columns, onCardCreated, onCardUpdated }: BoardProps) {
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <main className="board">
      {sortedColumns.map((column) => (
        <Column
          key={column.id}
          column={column}
          onCardCreated={onCardCreated}
          onCardUpdated={onCardUpdated}
        />
      ))}
    </main>
  );
}
