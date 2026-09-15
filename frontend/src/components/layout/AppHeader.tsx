import { useState } from 'react';

interface AppHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddColumn: (title: string) => Promise<void> | void;
}

export function AppHeader({ searchValue, onSearchChange, onAddColumn }: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setTitle('');
    setError(null);
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('列名は必須です');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onAddColumn(title.trim());
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '列の追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="app-header">
      <h1 className="app-title">タスク管理アプリ</h1>
      <input
        type="search"
        className="search-input"
        placeholder="カードを検索..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="カードを検索"
      />
      <button type="button" className="column-add-button" onClick={() => setIsOpen(true)}>
        + 列を追加
      </button>
      {isOpen && (
        <div className="modal-overlay" onClick={resetAndClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">列を追加</h3>
            <form className="card-create-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="列名"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {error && <p className="card-create-error">{error}</p>}
              <div className="card-create-actions">
                <button type="submit" disabled={isSubmitting}>
                  追加
                </button>
                <button type="button" onClick={resetAndClose} disabled={isSubmitting}>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
