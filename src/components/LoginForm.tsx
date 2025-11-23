"use client"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useState } from "react"
import {  usePathname } from "next/navigation"
import { toast } from "react-hot-toast"
import { useAuth } from "@/app/context/AuthContext"
import api from "@/app/lib/axios"
import { isAxiosError } from "axios"
import { jwtDecode } from "jwt-decode"
// import Link from "next/link"

export default function LoginForm() {
    const pathname = usePathname();
    const { login, logout } = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(event.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const response = await api.post(`/auth/login`, { email, password });
            login(response.data.accessToken);
            const decoded = jwtDecode<{ role: string }>(response.data.accessToken);
            
            if (decoded?.role === "ADMIN" && pathname.includes("/admin/login")) {
                toast.success("Đăng nhập thành công!");
                window.location.href = '/admin/dashboard';
            } else {
                const errMsg = "Bạn không có quyền quản trị.";
                setError(errMsg);
                toast.error(errMsg);
                logout();
            }
        } catch(err) {
            if (isAxiosError(err)) {
                const errMsg = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
                setError(errMsg);
                toast.error(errMsg);
            } else {
                const errMsg = "Có lỗi xảy ra. Vui lòng thử lại.";
                setError(errMsg);
                toast.error(errMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                    <CardDescription>
                        Nhập email và mật khẩu để đăng nhập tài khoản quản trị.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-center text-red-600">{error}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </div>

                        {/* <div className="mt-4 text-center text-sm">
                            Chưa có tài khoản?{" "}
                            <Link href="#" className="underline underline-offset-4">
                                Đăng ký
                            </Link>
                        </div> */}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
