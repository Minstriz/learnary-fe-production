"use client";

import * as React from "react";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  SquareStack,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavMain } from "@/components/features/nav-main";
import { NavProjects } from "@/components/features/nav-projects";
import { NavUser } from "@/components/features/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/app/context/AuthContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser, isLoading } = useAuth();
  const pathname = usePathname();
  const adminBasePath = `/${pathname.split('/')[1]}/admin`;
  if (isLoading) return null;

  const user = {
    email: authUser?.email || "No Email",
    avatar: authUser?.avatar || "",
  };

  const navMain = [
    {
      title: "Dashboard",
      url: `${adminBasePath}/dashboard`,
      icon: LayoutDashboard,
      isActive: pathname === `${adminBasePath}/dashboard`,
      items: [
        { title: "Tổng quan", url: `${adminBasePath}/dashboard` },
        // { title: "Thống kê", url: `${adminBasePath}/statistics` },
      ],
    },
    {
      title: "Course",
      url: `${adminBasePath}/courses`,
      icon: BookOpen,
      isActive: pathname.startsWith(`${adminBasePath}/courses`),
      items: [
        { title: "Tất cả khóa học", url: `${adminBasePath}/courses` },
        // { title: "Tạo khóa học", url: `${adminBasePath}/courses/create` },
      ],
    },
    {
      title: "Categories",
      url: `${adminBasePath}/categories`,
      icon: SquareStack,
      isActive: pathname.startsWith(`${adminBasePath}/categories`),
      items: [
        { title: "Tất cả danh mục", url: `${adminBasePath}/categories` },
      ],
    },
    {
      title: "Levels",
      url: `${adminBasePath}/levels`,
      icon: SquareStack,
      isActive: pathname.startsWith(`${adminBasePath}/levels`),
      items: [
        { title: "Tất cả cấp độ", url: `${adminBasePath}/levels` },
      ],
    },
    {
      title: "Users",
      url: `${adminBasePath}/users`,
      icon: Users,
      isActive: pathname.startsWith(`${adminBasePath}/users`),
      items: [
        { title: "Quản lý người dùng", url: `${adminBasePath}/users` },
        { title: "Quản lý giảng viên", url: `${adminBasePath}/users/instructors-management` },
        { title: "Quản lý học viên", url: `${adminBasePath}/users/learners-management` }
      ],
    },
    {
      title: "Phản hồi",
      url: `${adminBasePath}/feedbacks`,
      icon: MessageSquare,
      isActive: pathname.startsWith(`${adminBasePath}/feedbacks`),
      items: [
        { title: "Tất cả phản hồi", url: `${adminBasePath}/feedbacks` },
      ],
    },
    {
      title: "Cài đặt",
      url: `${adminBasePath}/settings`,
      icon: Settings2,
      isActive: pathname.startsWith(`${adminBasePath}/settings`),
      items: [],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-row px-2 py-4">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">LEARNARY PLATFORM</span>
          <span className="truncate text-xs">Quản Trị Viên</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={[]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
