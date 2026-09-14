import { useEffect, useState } from 'react';
import { getColumns } from '../api/columns';
import type { ColumnResponse } from '../api/types';
import { AppHeader } from '../components/layout/AppHeader';
import { Board } from '../components/board/Board';

export function BoardPage() {
  const [columns, setColumns] = useState<ColumnResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getColumns()
      .then(setColumns)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      });
  }, []);

  return (
    <>
      <AppHeader />
      {error && <p style={{ padding: 20, color: '#dc2626' }}>読み込みエラー: {error}</p>}
      {!error && columns === null && <p style={{ padding: 20 }}>読み込み中...</p>}
      {!error && columns !== null && <Board columns={columns} />}
    </>
  );
}
