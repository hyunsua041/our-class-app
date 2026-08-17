export type Notice = {
  id: string;
  title: string;
  content: string;
  dueDate?: string;
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
