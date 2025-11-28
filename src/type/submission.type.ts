import { Answer, Submissions } from './course.type';

export type CreateSubmissionPayload = {
  quiz_id: string;
  answers: {
    question_id: string;
    option_id: string;
  }[];
  duration: string;
};

export type SubmissionResult = Submissions & {
  answers: Answer[];
  score?: number;
  total_questions?: number;
};
