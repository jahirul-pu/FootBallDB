'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Shield, Keyboard, Palette, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Divider } from '@/components/ui/divider';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/config/routes.config';

export function ProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent focus-visible:ring-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2"
          aria-label="Profile menu"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.avatarUrl} alt={user?.firstName ?? 'User'} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-foreground text-sm leading-none font-medium">
              {user?.firstName ?? 'User'}
            </span>
          </div>
          <ChevronDown className="text-muted-foreground ml-1 h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
        {/* User Info Header */}
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatarUrl} alt={user?.firstName ?? 'User'} />
            <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-foreground truncate font-semibold">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'}
            </span>
            <span className="text-muted-foreground truncate text-xs">{user?.email ?? '—'}</span>
            {user?.role && (
              <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                <Shield className="mr-1 h-2.5 w-2.5" />
                {user.role}
              </Badge>
            )}
          </div>
        </div>

        <Divider />

        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.SETTINGS_PROFILE}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.SETTINGS_PREFERENCES}>
              <Palette className="mr-2 h-4 w-4" />
              Preferences
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.SETTINGS}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className="mr-2 h-4 w-4" />
            Keyboard Shortcuts
            <span className="text-muted-foreground ml-auto text-xs">?</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <Divider />

        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
