export type Notice = {
  id: string;
  title: string;
  content: string;
  dueDate?: string;
  subject?: string | null;
  createdAt: string;
};

export type Subject = {
  id: string;
  name: string;
  isCommon: boolean;
};

export type Student = {
  id: string;
  name: string;
  subjects: string[];
};

export type StudyGoal = {
  id: string;
  title: string;
  targetMinutes: number;
  actualMinutes?: number | null;
  points: number;
  completed: boolean;
  completedNote?: string | null;
  completedAt?: string | null;
  createdAt: string;
};

export type Praise = {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: string;
};

export type Photo = {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
};
