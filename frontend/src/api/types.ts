export interface CardResponse {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string | null;
  position: number;
}

export interface CardCreateRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
}

export interface CardUpdateRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  position: number;
}

export interface CardMoveRequest {
  columnId: number;
  position: number;
}

export interface ColumnResponse {
  id: number;
  title: string;
  position: number;
  cards: CardResponse[];
}
