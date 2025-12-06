"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Course, CourseGroupType } from "@/type/course.type";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, GripVertical, AlertTriangle } from "lucide-react";
import api from "@/app/lib/axios";

const comboSchema = z.object({
  name: z.string().min(1, "Tên combo là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  discount: z.number().min(0, "Giảm giá phải >= 0").max(100, "Giảm giá tối đa 100%"),
  courseIds: z.array(z.string()).min(2, "Phải chọn ít nhất 2 khóa học"),
});

type ComboFormData = z.infer<typeof comboSchema>;

interface SortableCourseItemProps {
  course: Course;
  index: number;
  isFirst: boolean;
}

function SortableCourseItem({ course, index, isFirst }: SortableCourseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.course_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${isDragging ? "shadow-lg z-50" : ""}`}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        <span className="font-semibold text-sm text-gray-700">#{index + 1}</span>
        {isFirst && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        <div className="flex-1">
          <p className="font-medium text-sm">{course.title}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {course.level?.level_name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Level Order: {course.level?.order_index}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CreateComboDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateComboDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateComboDialogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ComboFormData>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      discount: 0,
      courseIds: [],
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses/instructor/my-courses");
      const publishedCourses = response.data.filter(
        (c: Course) => c.status === "Published"
      );
      
      const sortedCourses = publishedCourses.sort((a: Course, b: Course) => {
        const aOrder = a.level?.order_index ?? 999;
        const bOrder = b.level?.order_index ?? 999;
        return aOrder - bOrder;
      });
      
      setCourses(sortedCourses);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
      console.error(error);
    }
  };

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.some((c) => c.course_id === course.course_id);
    
    if (isSelected) { 
      const newSelected = selectedCourses.filter((c) => c.course_id !== course.course_id);
      setSelectedCourses(newSelected);
      setValue("courseIds", newSelected.map((c) => c.course_id));
    } else {
      const newSelected = [...selectedCourses, course].sort((a, b) => {
        const aOrder = a.level?.order_index ?? 999;
        const bOrder = b.level?.order_index ?? 999;
        return aOrder - bOrder;
      });
      setSelectedCourses(newSelected);
      setValue("courseIds", newSelected.map((c) => c.course_id));
    }
  };

  const handleAutoSort = () => {
    const sorted = [...selectedCourses].sort((a, b) => {
      const aOrder = a.level?.order_index ?? 999;
      const bOrder = b.level?.order_index ?? 999;
      return aOrder - bOrder;
    });
    setSelectedCourses(sorted);
    toast.success("Đã sắp xếp tự động theo cấp độ");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedCourses((items) => {
        const oldIndex = items.findIndex((i) => i.course_id === active.id);
        const newIndex = items.findIndex((i) => i.course_id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const validateCourseOrder = (): boolean => {
    for (let i = 0; i < selectedCourses.length - 1; i++) {
      const currentLevel = selectedCourses[i].level?.order_index ?? 999;
      const nextLevel = selectedCourses[i + 1].level?.order_index ?? 999;
      
      if (currentLevel > nextLevel) {
        toast.error(
          `Thứ tự không hợp lệ: "${selectedCourses[i].title}" (Level ${currentLevel}) phải đứng sau "${selectedCourses[i + 1].title}" (Level ${nextLevel})`,
          { duration: 5000 }
        );
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (data: ComboFormData) => {
    if (!validateCourseOrder()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const groupResponse = await api.post("/groups", {
        name: data.name,
        description: data.description,
        type: CourseGroupType.Combo,
        discount: data.discount,
      });
      const groupId = groupResponse.data.group_id;
      const courseGroupPromises = selectedCourses.map((course, index) =>
        api.post("/course-groups", {
          group_id: groupId,
          course_id: course.course_id,
          order_index: index,
        })
      );
      await Promise.all(courseGroupPromises);
      toast.success("Tạo combo thành công!");
      reset();
      setSelectedCourses([]);
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error  ? error.message  : "Không thể tạo combo";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasOrderViolation = selectedCourses.some((course, index) => {
    if (index === 0) return false;
    const currentLevel = course.level?.order_index ?? 999;
    const prevLevel = selectedCourses[index - 1].level?.order_index ?? 999;
    return prevLevel > currentLevel;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Combo Khóa Học Mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="p-2">Tên Combo *</Label>
              <Input id="name" {...register("name")} placeholder="VD: Combo Lập Trình Web Từ Cơ Bản Đến Nâng Cao" />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="p-2">Mô Tả *</Label>
              <Textarea  id="description" {...register("description")} placeholder="Mô tả chi tiết về combo khóa học..." rows={3}/>
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="discount" className="p-2">Giảm Giá (%) *</Label>
              <Input id="discount" type="number" {...register("discount", { valueAsNumber: true })} placeholder="VD: 20" min={0} max={100} />
              {errors.discount && (
                <p className="text-sm text-red-500 mt-1">{errors.discount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="bg-yellow-400 h-fit p-1 rounded w-full text-center">Chọn Khóa Học (Tối thiểu 2, độ khó từ nhỏ đến lớn) *</Label>
            {errors.courseIds && (
              <p className="text-sm text-red-500">{errors.courseIds.message}</p>
            )}
            
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
              {courses.map((course) => (
                <div key={course.course_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <Checkbox id={course.course_id} checked={selectedCourses.some((c) => c.course_id === course.course_id)} onCheckedChange={() => handleCourseToggle(course)} />
                  <label htmlFor={course.course_id} className="flex-1 cursor-pointer text-sm" >
                    <span className="font-medium">{course.title}</span>
                    <span className="ml-2 text-gray-500">
                      ({course.level?.level_name} - Độ khó: {course.level?.order_index})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {selectedCourses.length >= 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Thứ Tự Khóa Học ({selectedCourses.length} khóa học)</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAutoSort}>
                  Sắp Xếp Tự Động
                </Button>
              </div>

              {hasOrderViolation && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">
                    Thứ tự không hợp lệ! Khóa học có level thấp hơn phải đứng trước.
                  </p>
                </div>
              )}

              <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={selectedCourses.map((c) => c.course_id)} strategy={verticalListSortingStrategy} >
                    {selectedCourses.map((course, index) => (
                      <SortableCourseItem key={course.course_id} course={course}  index={index} isFirst={index === 0}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <p className="text-xs text-gray-500">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 inline mr-1" />
                Khóa học đầu tiên sẽ được đánh dấu ưu tiên
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo Combo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
