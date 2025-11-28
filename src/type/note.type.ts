export type Note = {
  note_id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  createAt: string;
  updatedAt: string;
};

export type CreateNotePayload = {
  lesson_id: string;
  content: string;
};
