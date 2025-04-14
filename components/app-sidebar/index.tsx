"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import useAuthStore from "@/store/useAuthStore";
import {
  Users,
  Building2,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";

export function AppSidebar() {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState([
    {
      title: "Dashboard",
      url: "/pqr",
      icon: LayoutDashboard,
    },
  ]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
      setMenuItems([
        ...menuItems,
        {
          title: "Áreas",
          url: "/area",
          icon: Building2,
        },
        {
          title: "Usuarios",
          url: "/users",
          icon: Users,
        },
      ]);
    }
  }, [user]);

  function handleLogout() {
    console.log(document.cookie);
    // router.push("/dashboard");
  }

  return (
    <Sidebar className="sidebar">
      <SidebarHeader className="p-6 flex justify-center">
        <img src="/logo.png" alt="Logo" className="w-32 brightness-0 invert" />
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.url}
                href={item.url}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full justify-center text-red-100 hover:bg-red-500/20"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
