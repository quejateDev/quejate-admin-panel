"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react"

export default function LogoutButton() {

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="sidebar-link w-full justify-center"
    >
      <LogOut className="h-5 w-5" />
      <span>Cerrar Sesión</span>
    </button>
  );
}
