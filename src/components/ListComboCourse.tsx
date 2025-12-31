"use client";
import React, { useEffect, useState } from "react";
import ComboCourse from "./ComboCourse";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Group } from "@/type/course.type";
import { toast } from "sonner";
import api from "@/app/lib/axios";

type ListComboCourseProps = {
  title: string;
  combos?: Group[];
};

const fetchListCombos = async (): Promise<Group[]> => {
  try {
    const res = await api.get("/groups");
    const data = res.data;
    if (!data || data.length === 0) {
      toast.info("Hệ thống chưa có combo nào");
      return [];
    }
    // Filter combo có khóa học và Published
    const activeCombos = data.filter((combo: Group) => {
      if (!combo.hasCourseGroup || combo.hasCourseGroup.length === 0) return false;
      return combo.hasCourseGroup.every(cg => 
        cg.belongToCourse && cg.belongToCourse.status === "Published"
      );
    });
    return activeCombos;
  } catch {
    toast.error("Lỗi khi lấy danh sách combo!");
    return [];
  }
};

const ListComboCourse: React.FC<ListComboCourseProps> = ({ title, combos }) => {
  const [combosData, setCombosData] = useState<Group[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (combos && combos.length > 0) {
      setCombosData(combos);
    } else {
      const fetchData = async () => {
        const data = await fetchListCombos();
        setCombosData(data);
      };
      fetchData();
    }
  }, [combos]);

  if (!combosData || combosData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full">
        <p className="text-gray-500 relative">Hiện tại chưa có combo nào</p>
      </div>
    )
  }

  return isMobile ? (
    <div className="">
      <div className="title w-full font-roboto-condensed-bold text-2xl pl-5 pb-5 pt-5">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {combosData.map((combo) => (
          <ComboCourse key={combo.group_id} combo={combo} />
        ))}
      </div>
    </div>
  ) : (
    <div>
      <div className="title w-full font-roboto-condensed-bold text-2xl pl-2 pb-2 pt-5">{title}</div>
      <div className="flex flex-wrap gap-4 p-2">
        {combosData.map((combo) => (
          <div key={combo.group_id} className="sm:w-1/2 lg:w-1/4">
            <ComboCourse combo={combo} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListComboCourse;
