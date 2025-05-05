// src/components/layout/AppLayout.jsx
import React from "react";
import { AppSidebar } from "../pages/SideBar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import Header from "./SideBar/Header";


export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
      <Header/>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
