interface AppHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function AppHeader({ searchValue, onSearchChange }: AppHeaderProps) {
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
    </header>
  );
}
