"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Award,
  Activity,
  Bell,
  Mail,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
  Lightbulb,
  FileDown,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Communities",
    href: "/communities",
    icon: Users2,
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare,
  },
  {
    title: "Rewards",
    href: "/rewards",
    icon: Award,
  },
  {
    title: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Email Composer",
    href: "/emails",
    icon: Mail,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Insights",
    href: "/insights",
    icon: Lightbulb,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileDown,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (pathname.startsWith("/login")) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#131313] border-r border-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00FF80] flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-lg">Admin</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#00FF80] flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5 text-black" />
          </div>
        )}
        {isMounted && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "p-1.5 rounded-lg hover:bg-secondary transition-colors",
              isCollapsed && "absolute -right-3 top-6 bg-card border border-border"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                active
                  ? "bg-[#00FF80] text-black font-medium"
                  : "text-[#B3B3B3] hover:bg-secondary hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isCollapsed && "mx-auto")} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-[#B3B3B3] hover:bg-red-500/20 hover:text-red-400 transition-all"
            )}
          >
            <LogOut className={cn("w-5 h-5 flex-shrink-0", isCollapsed && "mx-auto")} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}


