import { deleteJson, patchJson, postJson } from './client';
import type {
  CardBulkUpdateRequest,
  CardCreateRequest,
  CardMoveRequest,
  CardResponse,
  CardUpdateRequest,
} from './types';

export function createCard(columnId: number, request: CardCreateRequest): Promise<CardResponse> {
  return postJson<CardResponse>(`/api/columns/${columnId}/cards`, request);
}

export function updateCard(cardId: number, request: CardUpdateRequest): Promise<CardResponse> {
  return patchJson<CardResponse>(`/api/cards/${cardId}`, request);
}

export function deleteCard(cardId: number): Promise<void> {
  return deleteJson(`/api/cards/${cardId}`);
}

export function moveCard(cardId: number, request: CardMoveRequest): Promise<CardResponse> {
  return patchJson<CardResponse>(`/api/cards/${cardId}/move`, request);
}

export function bulkUpdateCards(request: CardBulkUpdateRequest): Promise<CardResponse[]> {
  return patchJson<CardResponse[]>('/api/cards/bulk', request);
}

export function sortColumnByDueDate(columnId: number): Promise<CardResponse[]> {
  return patchJson<CardResponse[]>(`/api/columns/${columnId}/cards/sort-by-due-date`, {});
}

export function sortColumnByPriority(columnId: number): Promise<CardResponse[]> {
  return patchJson<CardResponse[]>(`/api/columns/${columnId}/cards/sort-by-priority`, {});
}
