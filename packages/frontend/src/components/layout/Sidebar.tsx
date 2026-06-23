"use client";

import { Building2, Clock, History, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/useAuth";

export function AppSidebar() {
  const { user } = useAuth();

  const commonItems = [
    { title: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
    { title: "打刻", href: "/attendance", icon: Clock },
    { title: "勤怠履歴", href: "/history", icon: History },
  ];

  const adminItems = [
    { title: "社員管理", href: "/admin/employees", icon: Users },
    { title: "部署管理", href: "/admin/departments", icon: Building2 },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="text-lg font-bold">勤怠管理</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel>管理</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
