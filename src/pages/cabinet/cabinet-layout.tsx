import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router"
import { LogOut } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { USERS } from "@/data/village"
import { useDemo } from "@/store/demo"
import { CABINET_SECTIONS } from "./nav"

export function CabinetLayout() {
  const user = useDemo((s) => s.user)
  const village = useDemo((s) => s.village)
  const { pathname } = useLocation()

  if (!user) return <Navigate to="/" replace />

  const sections = CABINET_SECTIONS.filter((s) => !s.ownerOnly || user === "owner")
  const current = sections.find((s) => pathname.startsWith(`/cabinet/${s.path}`))

  // Менеджеру профиль не виден, в том числе по прямой ссылке
  if (!current && pathname !== "/cabinet") return <Navigate to="/cabinet/plots" replace />

  return (
    <SidebarProvider>
      <CabinetSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-base font-semibold">{current?.label}</h1>
          <span className="ml-auto truncate text-sm text-muted-foreground md:hidden">{village.name}</span>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function CabinetSidebar() {
  const user = useDemo((s) => s.user)!
  const village = useDemo((s) => s.village)
  const logout = useDemo((s) => s.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const account = USERS[user]

  const sections = CABINET_SECTIONS.filter((s) => !s.ownerOnly || user === "owner")

  return (
    <Sidebar>
      <SidebarHeader className="gap-3 px-4 pt-4">
        <Logo />
        <div>
          <div className="font-heading text-sm font-semibold">{village.name}</div>
          <div className="text-xs text-muted-foreground">{village.site}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((s) => (
                <SidebarMenuItem key={s.path}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/cabinet/${s.path}`)}>
                    <Link to={`/cabinet/${s.path}`} onClick={() => setOpenMobile(false)}>
                      <s.icon />
                      <span>{s.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2 rounded-md p-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {account.name[0]}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-medium">{account.fullName}</div>
            <div className="truncate text-xs text-muted-foreground">{account.title}</div>
          </div>
          <button
            type="button"
            aria-label="Выйти"
            title="Выйти"
            onClick={() => {
              logout()
              navigate("/")
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
