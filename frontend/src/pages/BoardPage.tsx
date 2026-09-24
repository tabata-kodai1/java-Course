import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const latestRequestId = useRef(0);

  // 検索中は絞り込み後の一覧しか見えず、ドロップ位置をサーバー(全カード基準)と対応づけられないため、
  // ドラッグ&ドロップによる並べ替えを無効にする
  const isFiltering = keyword.trim() !== '';

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchColumns = useCallback(() => {
    // 検索の連続入力などで複数のリクエストが重なっても、最後に発行したリクエストの結果だけを反映する
    const requestId = ++latestRequestId.current;
    getColumns(keyword)
      .then((data) => {
        if (requestId !== latestRequestId.current) return;
        setColumns(data);
        setError(null);
        setActionError(null);
      })
      .catch((err: unknown) => {
        if (requestId !== latestRequestId.current) return;
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      });
  }, [keyword]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

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

  const handleBulkApply = async (priority?: string, dueDate?: string): Promise<boolean> => {
    try {
      await bulkUpdateCards({ cardIds: [...selectedCardIds], priority, dueDate });
      setSelectedCardIds(new Set());
      fetchColumns();
      return true;
    } catch (err) {
      console.error('一括更新に失敗しました', err);
      setActionError('一括更新に失敗しました。もう一度お試しください。');
      return false;
    }
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
          {actionError && (
            <div className="action-error" role="alert">
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                aria-label="エラー表示を閉じる"
              >
                ×
              </button>
            </div>
          )}
          {selectedCardIds.size > 0 && (
            <BulkUpdateToolbar
              selectedCount={selectedCardIds.size}
              onApply={handleBulkApply}
              onCancel={() => setSelectedCardIds(new Set())}
            />
          )}
          {isFiltering && (
            <p className="search-note">
              検索中は、カードのドラッグ&ドロップによる並べ替えはできません。
            </p>
          )}
          <Board
            columns={columns}
            onCardCreated={fetchColumns}
            onCardUpdated={fetchColumns}
            onColumnChanged={fetchColumns}
            selectedCardIds={selectedCardIds}
            onToggleCardSelect={handleToggleCardSelect}
            dragDisabled={isFiltering}
            onError={setActionError}
          />
        </>
      )}
    </>
  );
}
