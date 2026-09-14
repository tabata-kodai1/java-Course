import { useEffect, useState } from 'react';
import { getColumns } from '../api/columns';
import type { ColumnResponse } from '../api/types';
import { AppHeader } from '../components/layout/AppHeader';
import { Board } from '../components/board/Board';

const SEARCH_DEBOUNCE_MS = 300;

export function BoardPage() {
  const [columns, setColumns] = useState<ColumnResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    getColumns(keyword)
      .then(setColumns)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      });
  }, [keyword]);

  return (
    <>
      <AppHeader searchValue={searchInput} onSearchChange={setSearchInput} />
      {error && <p style={{ padding: 20, color: '#dc2626' }}>読み込みエラー: {error}</p>}
      {!error && columns === null && <p style={{ padding: 20 }}>読み込み中...</p>}
      {!error && columns !== null && <Board columns={columns} />}
    </>
  );
}
