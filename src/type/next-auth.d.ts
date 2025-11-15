// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// Định nghĩa các trường thêm vào JWT
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        role?: string;
        accessToken?: string;
    }
}

// Định nghĩa các trường thêm vào Session
declare module "next-auth" {
    /**
     * Mở rộng object User trả về từ `authorize`
     */
    interface User extends DefaultUser {
        id: string;
        role?: string;
        accessToken?: string;
    }

    /**
     * Mở rộng object Session
     */
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            role?: string;
        } & DefaultSession["user"]; 
    }
}