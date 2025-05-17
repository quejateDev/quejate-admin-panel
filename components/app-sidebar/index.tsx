import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Users, Building2, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import LogoutButton from "@/components/buttons/logoutButton";
import { getCookie } from "@/lib/utils";
import { verifyToken } from "@/lib/utils";
import OrganizationSelector from "@/components/OrganizationSelector";

interface CustomJWTPayload {
  id: string;
  role: string;
  email: string;
  entityId: string;
}

export default async function AppSidebar() {
  const token = await getCookie("token");

  if (!token) redirect("/login");

  let decoded: CustomJWTPayload | null = null;

  try {
    decoded = await verifyToken(token);
  
    // if (!decoded) redirect("/login");
  } catch (error) {
    console.error("Token verification error:", error);
    // redirect("/login");
  }

  const { role } = decoded || { role: "" };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/pqr",
      icon: LayoutDashboard,
    },
  ];

  const ADMIN_MENU_ITEMS = [
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
  ];

  const SUPER_ADMIN_MENU_ITEMS = [
    {
      title: "Organizaciones",
      url: "/entity",
      icon: Building2,
    },
  ];

  if (role !== UserRole.ADMIN) menuItems.push(...ADMIN_MENU_ITEMS);
  if (role === UserRole.SUPER_ADMIN) menuItems.push(...SUPER_ADMIN_MENU_ITEMS);

  return (
    <Sidebar className="sidebar">
      <SidebarHeader className="py-6 flex flex-col items-center gap-6 justify-center">
        <img src="/logo.png" alt="Logo" className="w-32 brightness-0 invert" />

        <OrganizationSelector userOrganizationId={decoded?.entityId || ""} />
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
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
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
