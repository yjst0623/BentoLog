export type ChildRating = 'finished' | 'some_left' | 'half_left';

export interface Dish {
  id: string;
  lunch_id: string;
  name: string;
  normalizedName: string;
  category: string;
}

export interface ChildFeedback {
  rating: ChildRating;
  comment?: string;
  inputAt: string;
}

export interface Lunch {
  id: string;
  date: string;
  photo: string; // base64 data URL
  dishes: Dish[];
  colorScore: number;
  nutritionScore: number;
  aiComment: string;
  childRating?: ChildFeedback;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppSettings {
  geminiKey: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  memo: string;
  createdAt: string;
}
