
export interface User {
  id: string;
  username: string;
  name: string;
  savedHymnIds: string[];
}

export enum HymnSectionType {
  VERSE = 'Verse',
  CHORUS = 'Chorus',
  BRIDGE = 'Bridge'
}

export interface HymnSection {
  type: string;
  lyrics: string;
}

export interface HymnData {
  id: string;
  number?: number; // Optional, only for existing hymns
  title: string;
  keySignature: string; // e.g., "C", "Eb"
  timeSignature: string;
  suggestedTempo: number; // BPM as number for slider
  scriptureReference: string;
  sections: HymnSection[];
  chords?: string; // Text description for AI hymns
  lyricsWithChords?: string; // ChordPro format or similar for existing hymns
  category?: string;
  createdBy?: string; // User ID
  createdAt?: string;
}

export interface WorshipPlanItem {
  moment: string; // "Introit", "Offering", "Sermon"
  suggestion: string; // Hymn title or number
  reasoning: string;
}

export interface WorshipPlan {
  theme: string;
  items: WorshipPlanItem[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum Tab {
  HYMNAL = 'HYMNAL',
  PLANNER = 'PLANNER',
  COMPOSER = 'COMPOSER',
  LIBRARY = 'LIBRARY'
}

export type VideoTheme = 'NEBULA' | 'NATURE' | 'CROSS' | 'MINIMAL' | 'GOLD';

export const PREDEFINED_THEMES = [
  { label: 'O Sábado', value: 'Sabbath Rest and Creation' },
  { label: 'A Segunda Vinda', value: 'The Second Coming of Jesus' },
  { label: 'Esperança', value: 'Christian Hope and Redemption' },
  { label: 'Saúde e Cura', value: 'Biblical Health and Healing' },
  { label: 'Profecia', value: 'The Three Angels Messages' },
  { label: 'Graça', value: 'Gods Amazing Grace' },
];