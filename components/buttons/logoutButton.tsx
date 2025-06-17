"use client";

import useAuthStore from "@/store/useAuthStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

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
