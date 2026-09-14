import { getJson } from './client';
import type { ColumnResponse } from './types';

export function getColumns(): Promise<ColumnResponse[]> {
  return getJson<ColumnResponse[]>('/api/columns');
}
