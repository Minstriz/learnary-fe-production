"use client";
import React from "react";

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="navbar-wrapper bg-white shadow-md">
      {children}
    </div>
  );
}