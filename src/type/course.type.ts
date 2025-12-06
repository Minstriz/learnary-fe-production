import { InstructorWithData } from "./user.type";

export type Course = {
  course_id:string,
  category_id:string,
  level_id:string,
  instructor_id:string,
  status?:StatusCourse,
  title?:string,
  slug?:string,
  requirement?:string,
  description?:string,
  thumbnail?:string,
  price?:number,
  sale_off?:boolean,
  hot?:boolean,
  tag?:boolean,
  available_language?:string;
  chapter?:Chapter[];
  category?:Category;
  instructor?:InstructorWithData;
  level?:Level;
}

export type Quiz = {
  quiz_id:string,
  chapter_id:string,
  title?:string,
  slug?:string,
  questions?: Question[]; 
}

export type Answer = {
  answer_id:string,
  submission_id:string,
  question_id:string,
  option_id?:string,
  is_correct?:boolean, 
}

export type Submissions = {
  submission_id?:string,
  quiz_id?:string,
  user_id?:string,
  is_completed?:boolean,
  duration?:string
}

export type Category = {
  category_id:string,
  category_name?:string,
  slug?:string,
}

export type Question = {
  question_id:string,
  quiz_id:string,
  title?:string,
  options?: Option[];  // Thêm dòng này
  order_index?: number;
}

export type Option = {
  option_id:string,
  question_id:string,
  option_content?:string,
  is_correct?:boolean,
  order_index?: number;
}

export enum StatusCourse {
  Draft = "Draft",
  Published = "Published",
  Archived = "Archived",
}

export enum CourseGroupType {
  Combo = "Combo",
  Group = "Group"
}

export type Group = {
  group_id: string;
  name: string;
  description: string;
  type: CourseGroupType;
  discount: number;
  createdAt?: string;
  updatedAt?: string;
  hasCourseGroup?: CourseGroupWithCourse[];
}

export type CourseGroup = {
  course_id: string;
  group_id: string;
  order_index: number;
}

export type CourseGroupWithCourse = CourseGroup & {
  belongToCourse: Course;
}

export type Level = {
  level_id: string;
  level_name: string;
  order_index: number;
}

export type Chapter = {
  chapter_id:string,
  course_id:string,
  chapter_title?:string,
  lessons:Lesson[]
  order_index?:number,
  quiz?: Quiz | null;
}

export type Lesson = {
    lesson_id:string,
    chapter_id:string,
    title?:string,
    video_url?:string | null,
    isCompleted?:boolean,
    badge?:string
    duration?:string,
    slug?:string,
    order_index?:number,
}

export type Feedback = {
    feedback_id:string,
    course_id:string,
    user_id:string,
    comment:string,
}
