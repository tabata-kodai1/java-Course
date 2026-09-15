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

export interface ColumnResponse {
  id: number;
  title: string;
  position: number;
  cards: CardResponse[];
}
