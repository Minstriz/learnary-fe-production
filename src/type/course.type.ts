import { Instructor, User } from "./user.type";
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
  chapters?:Chapter[];
  category?:Category;
  instructor?:InstructorWithData;
  level?:Level;
}
export type InstructorWithData = Instructor & { user? : User}
export type Category = {
  category_id:string,
  category_name:string,
  slug:string,
}
enum StatusCourse {
  Draft = "Draft",
  Published = "Published",
  Archived = "Archived",
}
export type Level = {
  level_id:string,
  level_name:string,
  slug:string,
}
export type Chapter = {
  chapter_id:string,
  course_id:string,
  chapter_title?:string,
  order_index?:number,
  lessons?:Lesson[]
}
export type Lesson = {
    lesson_id:string,
    chapter_id:string,
    title?:string,
    video_url?:string | null,
    isCompleted?:boolean,
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