import { patchJson, postJson } from './client';
import type { CardCreateRequest, CardMoveRequest, CardResponse, CardUpdateRequest } from './types';

export function createCard(columnId: number, request: CardCreateRequest): Promise<CardResponse> {
  return postJson<CardResponse>(`/api/columns/${columnId}/cards`, request);
}

export function updateCard(cardId: number, request: CardUpdateRequest): Promise<CardResponse> {
  return patchJson<CardResponse>(`/api/cards/${cardId}`, request);
}

export function moveCard(cardId: number, request: CardMoveRequest): Promise<CardResponse> {
  return patchJson<CardResponse>(`/api/cards/${cardId}/move`, request);
}
