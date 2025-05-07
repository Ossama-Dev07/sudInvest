"use client";

import {
  Bell,
  ChevronsUpDown,
  CircleUserRound,
  LogOut,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/AuthStore";
import useInitials from "@/hooks/useInitials";
import { useTheme } from "@/components/theme-provider";

export function NavUser() {
  const { logout } = useAuthStore();
 const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const initial = useInitials(user.prenom_utilisateur, user.nom_utilisateur);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navigate = useNavigate();
  const handle_Logout = async () => {
    await logout();
    navigate("/login");
  };
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold capitalize">
                  {user.nom_utilisateur} {user.prenom_utilisateur}
                </span>
                <span className="truncate text-xs">
                  {user.role_utilisateur}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.nom_utilisateur} {user.prenom_utilisateur}
                  </span>
                  <span className="truncate text-xs">
                    {user.role_utilisateur}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/utilisateurs/profile">
                <DropdownMenuItem>
                  <CircleUserRound />
                  Profile
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/utilisateurs/notification">
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex w-full h-8 gap-1 px-3 space-x-3 my-1">
              {[
                { theme: "light", Icon: Sun },
                { theme: "dark", Icon: Moon },
                { theme: "system", Icon: Monitor },
              ].map(({ theme: targetTheme, Icon }) => (
                <button
                  key={targetTheme}
                  onClick={() => setTheme(targetTheme)}
                  className={`flex items-center justify-center p-2 rounded-lg basis-1/3 ${
                    theme === targetTheme
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label={`Set theme to ${targetTheme}`}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <LogOut />
                  Déconnexion
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Êtes-vous sûr de vouloir vous déconnecter&nbsp;?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action vous déconnectera de votre compte. Vous pourrez
                    vous reconnecter à tout moment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <Button variant="destructive" onClick={handle_Logout}>
                    Continuer
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
