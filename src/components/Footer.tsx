"use client"
import React from "react";
import Link from "next/link";
import Image from "next/image";
const currentYear = new Date().getFullYear();

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-gray-100 py-8 border-t border-gray-800 " >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <div className="flex justify-center h-full w-fit">
                        <Link href={'/'}>
                            <Image width={120} height={100} alt='logo' src={"/Logo/Logo-White-NoBG.svg"} />
                        </Link>
                    </div>
                    <span className="hidden md:inline-block mx-2 text-gray-500">|</span>
                    <span className="text-sm text-gray-400">Nền tảng học tập trực tuyến cho mọi người</span>
                </div>
                <div className="flex gap-4 mt-2 md:mt-0">
                    <Link href="/" className="hover:text-blue-400 transition">Trang chủ</Link>
                    <Link href="/courses" className="hover:text-blue-400 transition">Khoá học</Link>
                    <Link href="/about" className="hover:text-blue-400 transition">Về chúng tôi</Link>
                    <Link href="/contact" className="hover:text-blue-400 transition">Liên hệ</Link>
                </div>
                <div className="flex gap-3 mt-2 md:mt-0">
                    <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-blue-500">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg>
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube" className="hover:text-red-500">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.454 3.5 12 3.5 12 3.5s-7.454 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.12 0 12 0 12s0 3.88.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.546 20.5 12 20.5 12 20.5s7.454 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.88 24 12 24 12s0-3.88-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub" className="hover:text-gray-400">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                    </a>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-4">&copy; {currentYear} Learnary. All rights reserved.</div>
        </footer>
    );
}
