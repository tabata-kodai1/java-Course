import { useEffect, useState } from 'react';
import { getColumns, createColumn } from '../api/columns';
import { bulkUpdateCards } from '../api/cards';
import type { ColumnResponse } from '../api/types';
import { AppHeader } from '../components/layout/AppHeader';
import { Board } from '../components/board/Board';
import { BulkUpdateToolbar } from '../components/board/BulkUpdateToolbar';

const SEARCH_DEBOUNCE_MS = 300;

export function BoardPage() {
  const [columns, setColumns] = useState<ColumnResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchColumns = () => {
    getColumns(keyword)
      .then(setColumns)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      });
  };

  useEffect(fetchColumns, [keyword]);

  const handleAddColumn = async (title: string) => {
    await createColumn({ title });
    fetchColumns();
  };

  const handleToggleCardSelect = (cardId: number) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleBulkApply = async (priority?: string, dueDate?: string) => {
    await bulkUpdateCards({ cardIds: [...selectedCardIds], priority, dueDate });
    setSelectedCardIds(new Set());
    fetchColumns();
  };

  return (
    <>
      <AppHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onAddColumn={handleAddColumn}
      />
      {error && <p style={{ padding: 20, color: '#dc2626' }}>読み込みエラー: {error}</p>}
      {!error && columns === null && <p style={{ padding: 20 }}>読み込み中...</p>}
      {!error && columns !== null && (
        <>
          {selectedCardIds.size > 0 && (
            <BulkUpdateToolbar
              selectedCount={selectedCardIds.size}
              onApply={handleBulkApply}
              onCancel={() => setSelectedCardIds(new Set())}
            />
          )}
          <Board
            columns={columns}
            onCardCreated={fetchColumns}
            onCardUpdated={fetchColumns}
            onColumnChanged={fetchColumns}
            selectedCardIds={selectedCardIds}
            onToggleCardSelect={handleToggleCardSelect}
          />
        </>
      )}
    </>
  );
}
