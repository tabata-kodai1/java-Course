import { useState } from 'react';

interface BulkUpdateToolbarProps {
  selectedCount: number;
  onApply: (priority?: string, dueDate?: string) => Promise<void> | void;
  onCancel: () => void;
}

export function BulkUpdateToolbar({ selectedCount, onApply, onCancel }: BulkUpdateToolbarProps) {
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canApply = Boolean(priority || dueDate);

  const handleApply = async () => {
    if (!canApply) return;
    setIsSubmitting(true);
    try {
      await onApply(priority || undefined, dueDate || undefined);
      setPriority('');
      setDueDate('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bulk-toolbar">
      <span className="bulk-toolbar-count">{selectedCount}件選択中</span>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="">優先度を変更しない</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="期限"
      />
      <button type="button" onClick={handleApply} disabled={!canApply || isSubmitting}>
        適用
      </button>
      <button type="button" onClick={onCancel} disabled={isSubmitting}>
        選択解除
      </button>
    </div>
  );
}
