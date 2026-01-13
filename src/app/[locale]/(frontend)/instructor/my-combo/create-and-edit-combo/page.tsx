"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Course, Group, CourseGroupType } from "@/type/course.type";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, GripVertical, AlertTriangle, ArrowLeft, Save } from "lucide-react";
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
  onRemove?: (courseId: string) => void;
}

function SortableCourseItem({ course, index, isFirst, onRemove }: SortableCourseItemProps) {
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
              Độ khó: {course.level?.order_index}
            </Badge>
          </div>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(course.course_id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            Xóa
          </Button>
        )}
      </div>
    </div>
  );
}

export default function CreateAndEditComboPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comboId = searchParams.get("id");
  const isEditMode = !!comboId;

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ComboFormData>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      discount: 0,
      courseIds: [],
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor), //sensor điều khiển bằng chuột
    useSensor(KeyboardSensor, { //sensor điều khiển bằng bàn phím
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const fetchComboData = useCallback(async () => {
    if (!comboId) return;
    setIsLoading(true);
    try {
      const [comboResponse, coursesResponse] = await Promise.all([
        api.get(`/groups/${comboId}`),
        api.get(`/course-groups/${comboId}/courses`)
      ]);
      
      const comboData: Group = comboResponse.data;
      const coursesInCombo = coursesResponse.data.map((cg: { belongToCourse: Course }) => cg.belongToCourse);
      if (coursesInCombo.length > 0) {
        setSelectedCategory(coursesInCombo[0].category.category_id);
      }
      
      reset({
        name: comboData.name,
        description: comboData.description,
        discount: comboData.discount,
        courseIds: coursesInCombo.map((c: Course) => c.course_id),
      });
      
      setSelectedCourses(coursesInCombo);
      setOriginalCourses(coursesInCombo);
      
      // Fetch courses sau khi đã set category
      await fetchCourses();
    } catch (error) {
      toast.error("Không thể tải thông tin combo");
      console.error(error);
      router.push("/instructor/my-combo");
    } finally {
      setIsLoading(false);
    }
  }, [comboId, reset, router]);

  useEffect(() => {
    if (isEditMode) {
      fetchComboData();
    } else {
      fetchCourses();
    }
  }, [isEditMode, fetchComboData]);

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.some((c) => c.course_id === course.course_id);
    
    if (isSelected) {
      const newSelected = selectedCourses.filter((c) => c.course_id !== course.course_id);
      setSelectedCourses(newSelected);
      setValue("courseIds", newSelected.map((c) => c.course_id));
      if (newSelected.length === 0) {
        setSelectedCategory(null);
      }
    } else {
      if (!selectedCategory) {
        setSelectedCategory(course.category_id);
      }
      if (selectedCategory && course.category_id !== selectedCategory) {
        toast.error("Chỉ có thể chọn các khóa học cùng danh mục!");
        return;
      }
      const newSelected = [...selectedCourses, course].sort((a, b) => {
        const aOrder = a.level?.order_index ?? 999;
        const bOrder = b.level?.order_index ?? 999;
        return aOrder - bOrder;
      });
      setSelectedCourses(newSelected);
      setValue("courseIds", newSelected.map((c) => c.course_id));
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    const newSelected = selectedCourses.filter((c) => c.course_id !== courseId);
    setSelectedCourses(newSelected);
    setValue("courseIds", newSelected.map((c) => c.course_id));
    if (newSelected.length === 0) {
      setSelectedCategory(null);
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
    const canSubmit: boolean = selectedCourses.length === 0 ||  selectedCourses.every((course) => course.category_id === selectedCourses[0].category_id);
    if (!canSubmit) {
      toast.error("Tất cả khóa học trong combo phải cùng danh mục!", { duration: 5000 });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEditMode && comboId) {
        await api.put(`/groups/${comboId}`, {
          name: data.name,
          description: data.description,
          type: CourseGroupType.Combo,
          discount: data.discount,
        });
        
        const removedCourses = originalCourses.filter(
          (oc) => !selectedCourses.some((sc) => sc.course_id === oc.course_id)
        );
        for (const course of removedCourses) {
          await api.delete(`/course-groups/${comboId}/courses/${course.course_id}`);
        }
        const newCourses = selectedCourses.filter(
          (sc) => !originalCourses.some((oc) => oc.course_id === sc.course_id)
        );
        
        for (let i = 0; i < newCourses.length; i++) {
          const index = selectedCourses.findIndex((c) => c.course_id === newCourses[i].course_id);
          await api.post("/course-groups", {
            group_id: comboId,
            course_id: newCourses[i].course_id,
            order_index: index,
          });
        }
        const orderUpdates = selectedCourses.map((course, index) => ({
          course_id: course.course_id,
          order_index: index,
        }));

        await api.put(`/course-groups/${comboId}/bulk-order`, {
          courses: orderUpdates,
        });

        toast.success("Cập nhật combo thành công!");
      } else {
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
      }
      
      router.push("/instructor/my-combo");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : isEditMode ? "Không thể cập nhật combo" : "Không thể tạo combo";
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 cursor-pointer" 
        onClick={() => router.push("/instructor/my-combo")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách combo
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold font-roboto-condensed-bold">
          {isEditMode ? "Chỉnh Sửa Combo" : "Tạo Combo Mới"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? "Cập nhật thông tin combo khóa học" : "Tạo combo khóa học mới với giá ưu đãi"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-pink-600 mb-4">Thông Tin Combo</h2>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Tên Combo *</Label>
                <Input id="name" {...register("name")} placeholder="VD: Combo Lập Trình Web Full Stack" />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div  className="flex flex-col gap-2">
                <Label htmlFor="description">Mô Tả *</Label>
                <Textarea id="description" {...register("description")} placeholder="Mô tả chi tiết về combo khóa học..." rows={6}/>
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div  className="flex flex-col gap-2">
                <Label htmlFor="discount">Giảm Giá (%) *</Label>
                <Input id="discount" type="number" {...register("discount", { valueAsNumber: true })}  placeholder="VD: 20" min={0} max={100}/>
                {errors.discount && (
                  <p className="text-sm text-red-500 mt-1">{errors.discount.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold text-pink-600 mb-4">Chọn Khóa Học *</h2>
              {errors.courseIds && (
                <p className="text-sm text-red-500 mb-3">{errors.courseIds.message}</p>
              )}
              
              {selectedCategory && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Danh mục đã chọn:</strong> {courses.find(c => c.category_id === selectedCategory)?.category?.category_name || "Không xác định"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Chỉ hiển thị các khóa học cùng danh mục
                  </p>
                </div>
              )}
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {courses
                  .filter((course) => !selectedCategory || course.category_id === selectedCategory)
                  .map((course) => {
                    const isSelected = selectedCourses.some((c) => c.course_id === course.course_id);
                    return (
                      <div 
                        key={course.course_id} 
                        className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox 
                          id={course.course_id} 
                          checked={isSelected}
                          onCheckedChange={() => handleCourseToggle(course)}
                        />
                        <label 
                          htmlFor={course.course_id} 
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <span className="font-medium">{course.title}</span>
                          <span className="ml-2 text-gray-500">
                            ({course.level?.level_name} - Order: {course.level?.order_index})
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {course.category?.category_name}
                          </div>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {selectedCourses.length >= 2 && (
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-pink-600">
                    Thứ Tự ({selectedCourses.length})
                  </h2>
                  <Button type="button" variant="outline" size="sm" onClick={handleAutoSort} className="cursor-pointer">
                    Sắp Xếp Tự Động
                  </Button>
                </div>

                {hasOrderViolation && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">
                      Thứ tự không hợp lệ! Level thấp phải đứng trước.
                    </p>
                  </div>
                )}

                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={selectedCourses.map((c) => c.course_id)} strategy={verticalListSortingStrategy}>
                      {selectedCourses.map((course, index) => (
                        <SortableCourseItem 
                          key={course.course_id} 
                          course={course} 
                          index={index} 
                          isFirst={index === 0}
                          onRemove={isEditMode ? handleRemoveCourse : undefined}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 inline mr-1" />
                  Khóa học đầu tiên được đánh dấu ưu tiên
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button  type="button"  variant="outline" onClick={() => router.push("/instructor/my-combo")} disabled={isSubmitting}className="cursor-pointer">
            Hủy
          </Button>
          <Button  type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? (isEditMode ? "Đang cập nhật..." : "Đang tạo...") : (isEditMode ? "Cập Nhật Combo" : "Tạo Combo")}
          </Button>
        </div>
      </form>
    </div>
  );
}
