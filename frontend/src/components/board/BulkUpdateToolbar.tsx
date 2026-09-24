import { useState } from 'react';

interface BulkUpdateToolbarProps {
  selectedCount: number;
  /** 適用に成功したら true を返す(失敗時は入力内容を残す) */
  onApply: (priority?: string, dueDate?: string) => Promise<boolean>;
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
      const succeeded = await onApply(priority || undefined, dueDate || undefined);
      if (succeeded) {
        setPriority('');
        setDueDate('');
      }
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
