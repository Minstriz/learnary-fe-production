"use client";

import { useState, useEffect } from "react";
import { Group, Course } from "@/type/course.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CreateComboDialog from "@/components/CreateComboDialog";
import EditComboDialog from "@/components/EditComboDialog";
import { Plus, Edit, Trash2, Package, Star, Calendar, Percent, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/app/lib/axios";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";

export default function MyComboPage() {
  const [combos, setCombos] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Group | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<Group | null>(null);
  const TYPE_KEY = "Combo"
  const isMobile = useIsMobile()
  useEffect(() => {
    fetchCombos();
  }, []);
  const fetchCombos = async () => {
    setIsLoading(true);
    try {
      const allCombo = await api.get(`/groups/type/${TYPE_KEY}`);
      const myCourses = await api.get("/courses/instructor/my-courses");
      const myCourseIds = myCourses.data.map((c: Course) => c.course_id); /* tạo 1 array chứa các id của khoá học */
      const instructorCombos = allCombo.data.filter((combo: Group) => {
        if (!combo.hasCourseGroup || combo.hasCourseGroup.length === 0) return false;
        return combo.hasCourseGroup.some((cg) => //.some sẽ trả về true/false, nếu có ít nhất 1 id course nằm trong course_group thì sẽ trả về true
          myCourseIds.includes(cg.belongToCourse.course_id)
        );
      });
      setCombos(instructorCombos);

    } catch (error) {
      toast.error("Không thể tải danh sách combo");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditCombo = (combo: Group) => {
    setSelectedCombo(combo);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (combo: Group) => {
    setComboToDelete(combo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!comboToDelete) return;
    try {
      await api.delete(`/groups/${comboToDelete.group_id}`);
      toast.success("Xóa combo thành công!");
      fetchCombos();
    } catch (error) {
      toast.error("Không thể xóa combo");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setComboToDelete(null);
    }
  };

  const calculateComboPrice = (combo: Group): number => {
    if (!combo.hasCourseGroup || combo.hasCourseGroup.length === 0) return 0;
    const totalPrice = combo.hasCourseGroup.reduce((sum, cg) => { //reduce sẽ rút gọn 1 mảng thành 1 đối tượng duy nhất (1 object, array khác, số, chuỗi...)
      const price = Number(cg.belongToCourse.price) || 0;
      return sum + price;
    }, 0);
    /* reduce((bienLuyTich,tungPhanTuDuocLap) => {xu ly}, giaTriKhoiDauCuaBienLuyTich) ==> Tra ve bienLuyTich sau khi duoc thay doi*/
    const discountedPrice = totalPrice * (1 - combo.discount / 100);
    return Math.round(discountedPrice);
  };

  const calculateSavings = (combo: Group): number => {
    if (!combo.hasCourseGroup || combo.hasCourseGroup.length === 0) return 0;
    const totalPrice = combo.hasCourseGroup.reduce((sum, cg) => {
      const price = Number(cg.belongToCourse.price) || 0;
      return sum + price;
    }, 0);
    const comboPrice = calculateComboPrice(combo);
    const savings = totalPrice - comboPrice;
    return Math.round(savings);
  };

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
      <Link href="/instructor">
        <Button variant="ghost" className="mb-4 cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại khu vực giảng viên
        </Button>
      </Link>
      <div className={`${isMobile ? 'flex-col gap-5' : 'items-center justify-between mb-8'} flex `}>
        <div className="flex w-full justify-center">
          <h1 className="text-3xl font-bold font-roboto-condensed-bold self-center">Combo Khóa Học của bạn</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="hover:bg-blue-600 hover:text-white bg-white border border-blue-600 text-blue-700 cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Tạo Combo Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-gray-700 font-roboto-condensed-bold">
              Tổng Số Combo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{combos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-gray-700 font-roboto-condensed-bold">
              Tổng Khóa Học Trong Combo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {combos.reduce((sum, combo) => sum + (combo.hasCourseGroup?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-gray-700 font-roboto-condensed-bold">
              Giảm Giá Trung Bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700" >
              {combos.length > 0 ? Math.round(combos.reduce((sum, c) => sum + c.discount, 0) / combos.length) : 0}
              %
            </div>
          </CardContent>
        </Card> */}
      </div>

      {combos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có combo nào</h3>
            <p className="text-gray-600 mb-4">
              Bắt đầu tạo combo khóa học đầu tiên của bạn
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Combo Đầu Tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {combos.map((combo) => (
            <Card key={combo.group_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{combo.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {combo.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-2xl text-red-500 font-roboto-condensed-bold">
                    <Percent className="h-5 w-5 mr-1" />
                    {combo.discount}% OFF
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Giá Combo</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(calculateComboPrice(combo))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tiết Kiệm</p>
                    <p className="text-lg font-semibold text-red-500">
                      -{new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(calculateSavings(combo))}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Khóa Học Trong Combo ({combo.hasCourseGroup?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {/* slice để lấy tối đa 3 phần tử đầu trong mảng để hiện ra */}
                    {combo.hasCourseGroup?.slice(0, 3).map((cg, index) => (
                      <div key={cg.course_id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <span className="font-semibold text-gray-700">#{index + 1}</span>
                        {index === 0 && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                        <span className="flex-1 truncate">{cg.belongToCourse.title}</span>
                        <span className="text-gray-600 font-medium">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(cg.belongToCourse.price || 0)}
                        </span>
                      </div>
                    ))}
                    {/* nếu có nhiều hơn 3 phần tử thì bỏ vô see more */}
                    {(combo.hasCourseGroup?.length || 0) > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{(combo.hasCourseGroup?.length || 0) - 3} khóa học khác
                      </p>
                    )}
                  </div>
                </div>

                {combo.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Tạo ngày: {new Date(combo.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => handleEditCombo(combo)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh Sửa
                  </Button>
                  <Button variant="destructive" className="flex-1 cursor-pointer" onClick={() => handleDeleteClick(combo)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateComboDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchCombos}
      />

      <EditComboDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchCombos}
        combo={selectedCombo}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa combo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa combo &quot;{comboToDelete?.name}&quot;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
