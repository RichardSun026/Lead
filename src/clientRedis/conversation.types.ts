export interface StoredMessage {
  message: string;
  isAssistant: boolean;
}

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type WeekPlan = Record<WeekDay, string>;
