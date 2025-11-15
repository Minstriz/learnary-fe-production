import { object, string } from "zod";

export const signInSchema = object({
    email: string()
        .email("Email không hợp lệ hoặc không được để trống"),

    password: string()
        .min(1, "Mật khẩu không được để trống")
        .min(4, "Mật khẩu phải dài hơn 4 ký tự")
        .max(32, "Mật khẩu phải ngắn hơn 32 ký tự"),
});