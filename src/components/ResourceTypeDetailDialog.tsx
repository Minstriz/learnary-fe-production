"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import api from "@/app/lib/axios";
import { ResourceTypeData, Permission, PermissionOnResource } from "@/type/administrator.type";
import { isAxiosError } from "axios";

type ResourceTypeDetailDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resourceType: ResourceTypeData;
};

export function ResourceTypeDetailDialog({
    open,
    onOpenChange,
    resourceType,
}: ResourceTypeDetailDialogProps) {
    const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssignedPermissions = useCallback(async () => {
        try {
            setIsLoading(true);
            const assignmentsResponse = await api.get(`/permission-resources/resource/${resourceType.resource_id}`);
            const assignments: PermissionOnResource[] = assignmentsResponse.data.success 
                ? assignmentsResponse.data.data 
                : assignmentsResponse.data;
            const permissions = assignments.map(a => a.permission).filter(Boolean) as Permission[];
            setAssignedPermissions(permissions);
        } catch (error) {
            console.error("Error fetching assigned permissions:", error);
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
            } else {
                toast.error("Không thể tải dữ liệu");
            }
        } finally {
            setIsLoading(false);
        }
    }, [resourceType.resource_id]);

    useEffect(() => {
        if (open) {
            fetchAssignedPermissions();
        }
    }, [open, resourceType.resource_id, fetchAssignedPermissions]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Chi tiết tài nguyên: {resourceType.resource_name}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        Các quyền được phép truy cập tài nguyên này
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
                                Tổng số quyền: {assignedPermissions.length}
                            </p>
                        </div>

                        {assignedPermissions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Chưa có quyền nào được gán cho tài nguyên này
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignedPermissions.map((permission) => (
                                    <div
                                        key={permission.permission_id}
                                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {permission.permission_name}
                                                </p>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600">
                                                    Quyền
                                                </Badge>
                                            </div>
                                            {permission.description && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {permission.description}
                                                </p>
                                            )}
                                        </div>
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
