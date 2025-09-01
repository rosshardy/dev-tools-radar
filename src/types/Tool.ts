export type Assessment = 'adopt' | 'trial' | 'evaluate' | 'aware';

export interface Reviewer {
  name: string;
  photoUrl: string;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  url: string;
  assessment: Assessment;
  ourPosition?: string;
  aiPosition?: string;
  reviewer?: Reviewer;
}

export interface BlipPosition {
  x: number;
  y: number;
  angle: number;
  radius: number;
}

export interface ToolWithPosition extends Tool {
  position: BlipPosition;
}
