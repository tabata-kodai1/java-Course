import { postJson } from './client';
import type { CardCreateRequest, CardResponse } from './types';

export function createCard(columnId: number, request: CardCreateRequest): Promise<CardResponse> {
  return postJson<CardResponse>(`/api/columns/${columnId}/cards`, request);
}
