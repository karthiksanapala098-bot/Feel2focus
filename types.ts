
export enum AppStep {
  LOGIN,
  GOAL_SELECTION,
  MOOD_SELECTION,
  DASHBOARD,
  TIMER,
  RELAXATION
}

export enum Mood {
  HIGHLY_ENERGIZED = '🚀 Highly Energized',
  FOCUSED_CALM = '🙂 Focused & Calm',
  NEUTRAL = '😐 Neutral',
  LOW_ENERGY = '😴 Low Energy',
  STRESSED = '😣 Stressed'
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface StudySession {
  id: string; // Added unique ID for tracking checkboxes
  topic: string;
  duration: number; // minutes
  type: 'focus' | 'break' | 'revision' | 'practice';
}

export interface CompletedSession extends StudySession {
  completedAt: Date;
  manualLog?: boolean; // Track if it was checked manually or completed via timer
}

export interface StudyPlan {
  title: string;
  sessions: StudySession[];
  motivation: string;
}

export interface ChatPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatPart[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
}
