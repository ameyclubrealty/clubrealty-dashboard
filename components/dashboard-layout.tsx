"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Building, Home, LayoutDashboard, LogOut, Settings, Users, Leaf, MessageSquareDiff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import { onAuthChange, signOut } from "@/lib/firebase/auth"
import { useToast } from "@/hooks/use-toast"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setIsLoading(false)
      if (!user) {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/properties/dashboard",
      label: "Properties",
      icon: Building,
      active: pathname.includes("/dashboard/properties"),
    },
    {
      href: "/dashboard/leads",
      label: "Leads",
      icon: Users,
      active: pathname.includes("/dashboard/leads"),
    },
    {
      href: "/dashboard/banners",
      label: "Banners",
      icon: Home,
      active: pathname.includes("/dashboard/banners"),
    },
    {
      href: "/dashboard/property-headings",
      label: "Property Headings",
      icon: Home,
      active: pathname.includes("/dashboard/property-headings"),
    },
    {
      href: "/dashboard/go-green",
      label: "Go Green",
      icon: Leaf,
      active: pathname.includes("/dashboard/go-green"),
    },
     {
      href: "/dashboard/blog",
      label: "Blog",
      icon: MessageSquareDiff ,
      active: pathname.includes("/dashboard/blog"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.includes("/dashboard/settings"),
    },
  ]

  const Sidebar = (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-20 items-center justify-center border-b px-4">
        <Link href="/dashboard" className="flex items-center justify-center">
          <Image src="/images/club-realty-logo.png" alt="Club Realty" width={150} height={60} priority />
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex h-16 items-center border-b px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {Sidebar}
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center justify-center">
            <Image src="/images/club-realty-logo.png" alt="Club Realty" width={120} height={48} priority />
          </Link>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 flex-col border-r md:flex">{Sidebar}</div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
