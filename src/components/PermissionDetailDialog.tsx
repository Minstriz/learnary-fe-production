"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import api from "@/app/lib/axios";
import { Permission, ResourceTypeData, PermissionOnResource } from "@/type/administrator.type";
import { isAxiosError } from "axios";

type PermissionDetailDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission: Permission;
};

type ResourceWithStatus = ResourceTypeData & {
    isAssigned: boolean;
};

export function PermissionDetailDialog({
    open,
    onOpenChange,
    permission,
}: PermissionDetailDialogProps) {
    const [resources, setResources] = useState<ResourceWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingResources, setUpdatingResources] = useState<Set<string>>(new Set());

    const fetchResourcesAndAssignments = useCallback(async () => {
        try {
            setIsLoading(true);
            const resourcesResponse = await api.get("/resource-types");
            if (!resourcesResponse) {
                toast.error("Lỗi không truy xuất được danh sách tài nguyên!");
                return;
            }
            const allResources: ResourceTypeData[] = resourcesResponse.data.success 
                ? resourcesResponse.data.data 
                : resourcesResponse.data;
            const assignmentsResponse = await api.get(`/permission-resources/permission/${permission.permission_id}`);
            const assignments: PermissionOnResource[] = assignmentsResponse.data.success 
                ? assignmentsResponse.data.data 
                : assignmentsResponse.data;

            const assignedResourceIds = new Set(
                assignments.map((a: PermissionOnResource) => a.resourceTypeId)
            );

            const resourcesWithStatus: ResourceWithStatus[] = allResources.map(
                (resource) => ({
                    ...resource,
                    isAssigned: assignedResourceIds.has(resource.resource_id),
                })
            );

            setResources(resourcesWithStatus);
        } catch (error) {
            console.error("Error fetching resources:", error);
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
            } else {
                toast.error("Không thể tải dữ liệu");
            }
        } finally {
            setIsLoading(false);
        }
    }, [permission.permission_id]);

    useEffect(() => {
        if (open) {
            fetchResourcesAndAssignments();
        }
    }, [open, permission.permission_id, fetchResourcesAndAssignments]);

    const handleToggleResource = async (resource: ResourceWithStatus) => {
        const resourceId = resource.resource_id;
        if (updatingResources.has(resourceId)) {
            return;
        }
        setUpdatingResources((prev) => new Set(prev).add(resourceId));
        try {
            if (resource.isAssigned) {
                await api.delete(`/permission-resources/unassign`, {
                    data: {
                        permissionId: permission.permission_id,
                        resourceTypeId: resourceId,
                    }
                });
                toast.success(`Đã gỡ tài nguyên "${resource.resource_name}"`);
            } else {
                await api.post("/permission-resources", {
                    permissionId: permission.permission_id,
                    resourceTypeId: resourceId,
                });
                toast.success(`Đã cấp tài nguyên "${resource.resource_name}"`);
            }
            setResources((prev) =>
                prev.map((r) =>
                    r.resource_id === resourceId ? { ...r, isAssigned: !r.isAssigned } : r
                )
            );
        } catch (error) {
            console.error("Error toggling resource:", error);
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Không thể cập nhật tài nguyên");
            } else {
                toast.error("Không thể cập nhật tài nguyên");
            }
        } finally {
            setUpdatingResources((prev) => {
                const newSet = new Set(prev);
                newSet.delete(resourceId);
                return newSet;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Chi tiết quyền: {permission.permission_name}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        Quản lý tài nguyên cho quyền này
                    </p>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner />
                    </div>
                ) : (
                    <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <p className="text-sm font-medium text-gray-700">
                                Tổng số tài nguyên: {resources.length}
                            </p>
                            <p className="text-sm font-medium text-green-600">
                                Đã cấp: {resources.filter((r) => r.isAssigned).length}
                            </p>
                        </div>

                        {resources.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Chưa có tài nguyên nào trong hệ thống
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {resources.map((resource) => (
                                    <div
                                        key={resource.resource_id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={`resource-${resource.resource_id}`}
                                                className="font-medium cursor-pointer"
                                            >
                                                {resource.resource_name}
                                            </Label>
                                        </div>
                                        <Switch
                                            id={`resource-${resource.resource_id}`}
                                            checked={resource.isAssigned}
                                            onCheckedChange={() => handleToggleResource(resource)}
                                            disabled={updatingResources.has(resource.resource_id)}
                                            className="ml-4"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
