import type { ColumnResponse } from '../../api/types';
import { Column } from './Column';

interface BoardProps {
  columns: ColumnResponse[];
  onCardCreated: () => void;
  onCardUpdated: () => void;
  onColumnChanged: () => void;
  selectedCardIds: Set<number>;
  onToggleCardSelect: (cardId: number) => void;
  dragDisabled: boolean;
  onError: (message: string) => void;
}

export function Board({
  columns,
  onCardCreated,
  onCardUpdated,
  onColumnChanged,
  selectedCardIds,
  onToggleCardSelect,
  dragDisabled,
  onError,
}: BoardProps) {
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <main className="board">
      {sortedColumns.map((column) => (
        <Column
          key={column.id}
          column={column}
          onCardCreated={onCardCreated}
          onCardUpdated={onCardUpdated}
          onColumnChanged={onColumnChanged}
          selectedCardIds={selectedCardIds}
          onToggleCardSelect={onToggleCardSelect}
          dragDisabled={dragDisabled}
          onError={onError}
        />
      ))}
    </main>
  );
}
