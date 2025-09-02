import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Users, Building2, LayoutDashboard, Tag, Scale, FileText } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import LogoutButton from "@/components/buttons/logoutButton";
import { Logo } from "../Logo";
import { currentRole } from "@/lib/auth";


export default async function AppSidebar() {
  const role = await currentRole();

  const getMenuItemsByRole = () => {
    const baseMenu = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ];

    if (role === UserRole.SUPER_ADMIN) {
      return [
        ...baseMenu,
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
        {
          title: "PQRSD",
          url: "/pqr",
          icon: FileText,
        },
      ];
    }

    if (role === UserRole.ADMIN) {
      return [
        ...baseMenu,
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
        {
          title: "PQRSD",
          url: "/pqr",
          icon: FileText,
        },
      ];
    }

    if (role === UserRole.EMPLOYEE) {
      return [
        {
          title: "PQRSD",
          url: "/pqr",
          icon: FileText,
        },
      ];
    }

    return baseMenu;
  };

  const menuItems = getMenuItemsByRole();

  const SUPER_ADMIN_MENU_ITEMS = [
    {
      title: "Entidades",
      url: "/entity",
      icon: Building2,
    },
    {
      title: "Categorías",
      url: "/categories",
      icon: Tag,
    },
    {
      title: "Abogados",
      url: "/lawyers",
      icon: Scale,
    },
  ];

  return (
    <Sidebar className="sidebar">
      <SidebarHeader className="py-6 flex flex-col items-center gap-6 justify-center">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 flex flex-col gap-6">
        {role === UserRole.SUPER_ADMIN && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-medium border-b border-gray-300 pb-2">
              Super Admin
            </h2>
            <nav className="space-y-1">
              {SUPER_ADMIN_MENU_ITEMS.map((item) => {
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className="sidebar-link"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        {menuItems.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-medium border-b border-gray-300 pb-2">
              Gestión de la organización
            </h2>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                // const isActive = pathname === item.url;
                const isActive = false;
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
