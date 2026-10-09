"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/shared/ui/sidebar"

import { NavMain } from "./nav-main"
import { UserMenu, type MenuUser } from "./user-menu"

// Follows shadcn's sidebar-07 block: collapses to icons on desktop and
// becomes a sheet on mobile. The roomier padding applies only when expanded:
// the collapsed rail is 48px and needs shadcn's 8px to centre 32px icons.
// workspaceSwitcher is rendered by the server layout (same pattern as
// signOutItem): importing the workspaces barrel here would pull its
// server-only queries into the browser.
export function AppSidebar({
  workspaceSwitcher,
  user,
  signOutItem,
}: {
  workspaceSwitcher: React.ReactNode
  user: MenuUser
  signOutItem: React.ReactNode
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>{workspaceSwitcher}</SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-4 bg-sidebar-border/60 group-data-[collapsible=icon]:mx-2" />
      <SidebarContent className="px-1 group-data-[collapsible=icon]:px-0">
        <NavMain />
      </SidebarContent>
      <SidebarSeparator className="mx-4 bg-sidebar-border/60 group-data-[collapsible=icon]:mx-2" />
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu user={user} signOutItem={signOutItem} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
