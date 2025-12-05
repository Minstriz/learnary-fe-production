"use client";


import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

export function AppBreadcrumb() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile()
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const segments = pathname.split("/").filter(Boolean);

    return (
        <div className={isMobile ? 'hidden' : ''}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        {segments.length === 0 ? (
                            <BreadcrumbPage>Trang chủ</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link href="/">Trang chủ</Link>
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>

                    {segments.length > 0 && <BreadcrumbSeparator />}

                    {segments.map((segment, index) => {
                        const href = "/" + segments.slice(0, index + 1).join("/");
                        const isLast = index === segments.length - 1;
                        const formatted = segment
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase());

                        return (
                            <React.Fragment key={href}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{formatted}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>{formatted}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
