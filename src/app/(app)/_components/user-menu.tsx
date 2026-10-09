"use client"

import { ChevronsUpDownIcon, SettingsIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { SidebarMenuButton, useSidebar } from "@/shared/ui/sidebar"

import { userMenuItemClass } from "./nav-config"

export type MenuUser = {
  name: string
  email: string
  image: string | null | undefined
  /** The picked llama (settings → profile), shown in the open menu. */
  mascot: { src: string; label: string } | null
}

function initials({ name, email }: MenuUser) {
  return (name.trim() || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function UserAvatar({
  user,
  size,
}: {
  user: MenuUser
  size?: "default" | "lg"
}) {
  return (
    <Avatar size={size}>
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback>{initials(user)}</AvatarFallback>
    </Avatar>
  )
}

function UserSummary({ user }: { user: MenuUser }) {
  return (
    <div className="grid min-w-0 flex-1 text-left leading-tight">
      <span className="truncate text-sm font-medium text-foreground">
        {user.name || "Add your name"}
      </span>
      <span className="truncate text-xs text-muted-foreground">
        {user.email}
      </span>
    </div>
  )
}

/**
 * The sidebar-footer user menu. `signOutItem` is rendered by the server
 * layout: importing it here would pull the auth slice's server-only code
 * into the browser.
 */
export function UserMenu({
  user,
  signOutItem,
}: {
  user: MenuUser
  signOutItem: React.ReactNode
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const closeMobileSidebar = () => isMobile && setOpenMobile(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
        }
      >
        <UserAvatar user={user} />
        <UserSummary user={user} />
        <ChevronsUpDownIcon className="ml-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-65 p-1.5"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2.5 font-normal">
            <UserAvatar user={user} size="lg" />
            <UserSummary user={user} />
          </DropdownMenuLabel>
          {user.mascot && (
            <div className="flex justify-center px-2 pb-1">
              <Image
                src={user.mascot.src}
                alt={`${user.mascot.label} llama`}
                width={160}
                height={160}
                className="size-32 object-contain"
              />
            </div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={userMenuItemClass}
            render={<Link href="/settings" onClick={closeMobileSidebar} />}
          >
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuGroup>{signOutItem}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
