"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { BarChart3, Coffee, FileText, Home, LogOut, Settings, ShoppingBag, Users, Utensils } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      roles: ["admin", "reception", "kitchen"],
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      roles: ["admin"],
    },
    {
      label: "Guests",
      icon: Users,
      href: "/guests",
      roles: ["admin", "reception"],
    },
    {
      label: "Menu Items",
      icon: Coffee,
      href: "/menu-items",
      roles: ["admin", "kitchen"],
    },
    {
      label: "Services",
      icon: ShoppingBag,
      href: "/services",
      roles: ["admin", "reception"],
    },
    {
      label: "Kitchen Orders",
      icon: Utensils,
      href: "/kitchen-orders",
      roles: ["admin", "reception", "kitchen"],
    },
    {
      label: "Invoices",
      icon: FileText,
      href: "/invoices",
      roles: ["admin", "reception"],
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/reports",
      roles: ["admin"],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["admin"],
    },
  ]

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 flex flex-col h-full">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Resort Management</h2>
          <div className="space-y-1">
            {routes
              .filter((route) => user?.role && route.roles.includes(user.role))
              .map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    pathname === route.href ? "bg-muted text-primary" : "text-muted-foreground",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
          </div>
        </div>
        <div className="mt-auto px-3 py-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
