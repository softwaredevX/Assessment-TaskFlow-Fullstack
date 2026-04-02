export interface UserResponse {
  id: string; 
  email: string; 
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface BoardResponse {
  id: string; 
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string; 
  updated_at: string; 
}

export interface ListResponse {
  id: string; 
  name: string;
  board_id: string; 
  position: number;
  created_at: string; 
  updated_at: string; 
}

export interface CardResponse {
  id: string; 
  title: string;
  description: string | null;
  list_id: string;
  rank: string;
  version: number;
  created_at: string; 
  updated_at: string; 
}

export interface ListWithCardsResponse extends ListResponse {
  cards: CardResponse[];
}

export interface BoardWithListsResponse extends BoardResponse {
  lists: ListWithCardsResponse[];
}

export interface CardCreate {
  title: string;
  description?: string | null;
  list_id: string;
}

export interface CardUpdate {
  title?: string | null;
  description?: string | null;
}

export interface CardMove {
  list_id: string; 
  after_card_id?: string | null;  
  before_card_id?: string | null; 
  rank?: string | null;
}

export interface BoardCreate {
  name: string;
  description?: string | null;
}

export interface ListCreate {
  name: string;
}

export interface HTTPValidationError {
  detail: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
}
