import { useEffect, useState } from 'react';
import { createCard } from '../../api/cards';

interface CardCreateFormProps {
  columnId: number;
  onCreated: () => void;
}

export function CardCreateForm({ columnId, onCreated }: CardCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setError(null);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createCard(columnId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
      resetAndClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カードの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="card-add-button" onClick={() => setIsOpen(true)}>
        + カードを追加
      </button>
      {isOpen && (
        <div className="modal-overlay" onClick={resetAndClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">カードを追加</h3>
            <form className="card-create-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                placeholder="詳細(任意)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
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
    </>
  );
}
