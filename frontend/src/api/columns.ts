import { deleteJson, getJson, patchJson, postJson } from './client';
import type { ColumnCreateRequest, ColumnResponse, ColumnUpdateRequest } from './types';

export function getColumns(keyword?: string): Promise<ColumnResponse[]> {
  const trimmed = keyword?.trim();
  const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
  return getJson<ColumnResponse[]>(`/api/columns${query}`);
}

export function createColumn(request: ColumnCreateRequest): Promise<ColumnResponse> {
  return postJson<ColumnResponse>('/api/columns', request);
}

export function updateColumn(
  columnId: number,
  request: ColumnUpdateRequest,
): Promise<ColumnResponse> {
  return patchJson<ColumnResponse>(`/api/columns/${columnId}`, request);
}

export function deleteColumn(columnId: number): Promise<void> {
  return deleteJson(`/api/columns/${columnId}`);
}
