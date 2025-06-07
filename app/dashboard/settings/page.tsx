import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building, Globe, Lock, Mail, User } from "lucide-react"

export default function SettingsPage() {
  const settingsCategories = [
    {
      title: "Account",
      description: "Manage your account settings and preferences",
      icon: User,
      href: "/dashboard/settings/account",
    },
    {
      title: "Security",
      description: "Update your security preferences and password",
      icon: Lock,
      href: "/dashboard/settings/security",
    },
    {
      title: "Notifications",
      description: "Configure how you receive notifications",
      icon: Mail,
      href: "/dashboard/settings/notifications",
    },
    {
      title: "Website",
      description: "Manage your website settings",
      icon: Globe,
      href: "/dashboard/settings/website",
    },
    {
      title: "Theme",
      description: "Customize the appearance of your dashboard",
      icon: Building,
      href: "/dashboard/settings/theme",
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => (
          <Link key={category.title} href={category.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                <category.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
