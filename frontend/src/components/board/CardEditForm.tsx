import { useEffect, useState } from 'react';
import { updateCard } from '../../api/cards';
import type { CardResponse } from '../../api/types';

interface CardEditFormProps {
  card: CardResponse;
  onClose: () => void;
  onUpdated: () => void;
}

export function CardEditForm({ card, onClose, onUpdated }: CardEditFormProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [dueDate, setDueDate] = useState(card.dueDate ?? '');
  const [priority, setPriority] = useState(card.priority ?? 'medium');
  const position = card.position;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateCard(card.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        position,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カードの更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">カードを編集</h3>
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
              保存
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
