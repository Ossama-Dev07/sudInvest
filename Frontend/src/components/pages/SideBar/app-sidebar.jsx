
import * as React from "react";
import {
  FileText,
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutGrid,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

// This is sample data.
const data = {
  
  teams: [
    {
      name: "SudInvest",
      logo: GalleryVerticalEnd,
      plan: "Contsulting",
    },
  ],
  navMain: [
    {
      title: "Utilisateur",
      url: "#",
      icon: UserCog,
      isActive: true,
      items: [
        {
          title: "Ajouter un utilisateur",
          url: "/utilisateurs/ajouter",
        },
        {
          title: "Liste des utiliteurs",
          url: "/utilisateurs",
        },
        {
          title: "Archive",
          url: "/utilisateurs/Archive",
        },
      ],
    },
    {
      title: "Clients",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Ajouter un client",
          url: "/clients/ajouter",
        },
        {
          title: "Liste des clients",
          url: "/clients",
        },
        {
          title: "Archive",
          url: "/clients/Archive",
        },
      ],
    },
  ],
  projects: [

    {
      name: "Historique Juridique",
      url: "/historique_juridique",
      icon: FileText,
    },
    {
      name: "Paramètre",
      url: "/parametre",
      icon: Settings2,
    },
    {
      name: "Calendrier",
      url: "/calendrier",
      icon: Calendar,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { isMobile } = useSidebar();
  return (
      //u can add collapsible="icon"  to display icons when sidebar closed
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="mb-8">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mb-[-20px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/tableau-de-bord">
                  <LayoutGrid />
                  <span>Tableau de bord</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
