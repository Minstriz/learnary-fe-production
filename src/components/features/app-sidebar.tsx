"use client";

import * as React from "react";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
/*   Settings2, */
  SquareStack,
  Users,
  ShieldUser,
  ArrowLeftRight,
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
import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { AdminRolePermission, PermissionOnResource } from "@/type/administrator.type";
import Image from 'next/image';
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser, isLoading } = useAuth();
  const pathname = usePathname();
  const adminBasePath = `/${pathname.split('/')[1]}/admin`;
  const [adminResources, setAdminResources] = useState<string[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  
  const userId = authUser?.id;
  
  const user = {
    email: authUser?.email || "No Email",
    avatar: authUser?.avatar || "",
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!userId) {
        setAdminLoading(false);
        return;
      }

      try {
        setAdminLoading(true);
        const response = await api.get(`/admins/getAdminByUserId/${userId}`);
        const admin = response.data.data;
        if (admin?.admin_role_id) {
          try {
            const permissionsResponse = await api.get(`/admin-role-permissions`);
            const allAssignments = permissionsResponse.data.success 
              ? permissionsResponse.data.data 
              : permissionsResponse.data;
            const rolePermissions = allAssignments.filter(
              (a: AdminRolePermission) => a.admin_role_id === admin.admin_role_id
            );
            
            if (rolePermissions.length === 0) {
              setAdminResources([]);
              return;
            }
            const resourceSet = new Set<string>();
            
            for (const assignment of rolePermissions) {
              const permissionId = assignment.permission_id;
              try {
                const resourcesResponse = await api.get(`/permission-resources/permission/${permissionId}`);
                const permissionResources = resourcesResponse.data.success ? resourcesResponse.data.data : resourcesResponse.data;
                permissionResources.forEach((pr: PermissionOnResource) => {
                  if (pr.resource?.resource_name) {
                    resourceSet.add(pr.resource.resource_name);
                  }
                });
              } catch (error) {
                console.error(`Error fetching resources for permission ${permissionId}:`, error);
              }
            }
            
              const resourcesArray = Array.from(resourceSet);
            console.log("🔑 Admin Resources:", resourcesArray);
            setAdminResources(resourcesArray);
          } catch (error) {
            console.error("Error fetching admin permissions:", error);
            setAdminResources([]);
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminResources([]);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAdminData();
  }, [userId]);
  
  const allNavItems = [
    {
      title: "Tổng quan",
      url: `${adminBasePath}/dashboard`,
      icon: LayoutDashboard,
      isActive: pathname === `${adminBasePath}/dashboard`,
      items: [
        { title: "Tổng quan", url: `${adminBasePath}/dashboard` },
      ],
      requiredResources: [], 
    },
    {
      title: "Khóa học",
      url: `${adminBasePath}/courses`,
      icon: BookOpen,
      isActive: pathname.startsWith(`${adminBasePath}/courses`),
      items: [
        { title: "Tất cả khóa học", url: `${adminBasePath}/courses` },
      ],
      requiredResources: ["COURSE"],
    },
    {
      title: "Danh mục",
      url: `${adminBasePath}/categories`,
      icon: SquareStack,
      isActive: pathname.startsWith(`${adminBasePath}/categories`),
      items: [
        { title: "Tất cả danh mục", url: `${adminBasePath}/categories` },
      ],
      requiredResources: ["CATEGORY"],
    },
    {
      title: "Cấp độ",
      url: `${adminBasePath}/levels`,
      icon: SquareStack,
      isActive: pathname.startsWith(`${adminBasePath}/levels`),
      items: [
        { title: "Tất cả cấp độ", url: `${adminBasePath}/levels` },
      ],
      requiredResources: ["LEVEL"],
    },
    {
      title: "Người dùng",
      url: `${adminBasePath}/users`,
      icon: Users,
      isActive: pathname.startsWith(`${adminBasePath}/users`),
      items: [
        { title: "Quản lý người dùng", url: `${adminBasePath}/users` },
        { title: "Quản lý giảng viên", url: `${adminBasePath}/users/instructors-management` },
        { title: "Quản lý học viên", url: `${adminBasePath}/users/learners-management` }
      ],
      requiredResources: ["USER", "INSTRUCTOR"],
    },
    {
      title: "Phản hồi",
      url: `${adminBasePath}/feedbacks`,
      icon: MessageSquare,
      isActive: pathname.startsWith(`${adminBasePath}/feedbacks`),
      items: [
        { title: "Tất cả phản hồi", url: `${adminBasePath}/feedbacks` },
      ],
      requiredResources: ["FEEDBACK"],
    },
    {
      title: "Transactions",
      url: `${adminBasePath}/transactions`,
      icon: ArrowLeftRight,
      isActive: pathname.startsWith(`${adminBasePath}/transactions`),
      items: [
        { title: "Tất cả giao dịch", url: `${adminBasePath}/transactions` },
        { title: "Yêu cầu rút tiền", url: `${adminBasePath}/transactions/withdraw` },
      ],
      requiredResources: ["TRANSACTION"],
    },
/*     {
      title: "Cài đặt",
      url: `${adminBasePath}/settings`,
      icon: Settings2,
      isActive: pathname.startsWith(`${adminBasePath}/settings`),
      items: [],
      requiredResources: [], 
    }, */
    {
      title: "Người quản trị",
      url: `${adminBasePath}/administrators`,
      icon: ShieldUser,
      isActive: pathname.startsWith(`${adminBasePath}/administrators`),
      items: [
        { title: "Quản lý quyền truy cập", url: `${adminBasePath}/administrators/permission` },
        { title: "Quản lý vai trò", url: `${adminBasePath}/administrators/admin-role` },
        { title: "Quản lý loại tài nguyên", url: `${adminBasePath}/administrators/resource-types` },
        { title: "Quản lý tài khoản quản trị viên", url: `${adminBasePath}/administrators/admin-account-management` },
      ],
      requiredResources: [], // Only check for ALL resource
    },
  ];

  const navMain = allNavItems.filter(item => {
    console.log(`📋 Checking item: ${item.title}, required: [${item.requiredResources?.join(', ') || 'NONE'}]`);
    
    if (adminResources.includes("ALL")) {
      console.log(`  ✅ Admin has ALL permission`);
      return true;
    }
    if (!item.requiredResources || item.requiredResources.length === 0) {
      console.log(`  ✅ Item has no requirements`);
      return true;
    }
    const hasPermission = item.requiredResources.some(resource => adminResources.includes(resource));
    console.log(`  ${hasPermission ? '✅' : '❌'} Permission check result: ${hasPermission}`);
    return hasPermission;
  });

  if (isLoading || adminLoading) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-row px-2 py-4 gap-3 items-center">
        <div className="relative w-8 h-8 shrink-0">
          <Image
            src={'/Logo/Logo-Black-NoBG.svg'}
            alt={"Logo Platform"}
            fill
            className="object-contain"
            priority
          />
        </div>
        
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
