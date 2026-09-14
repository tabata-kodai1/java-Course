import { getJson } from './client';
import type { ColumnResponse } from './types';

export function getColumns(keyword?: string): Promise<ColumnResponse[]> {
  const trimmed = keyword?.trim();
  const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
  return getJson<ColumnResponse[]>(`/api/columns${query}`);
}
