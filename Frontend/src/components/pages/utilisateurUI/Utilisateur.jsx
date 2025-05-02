"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { columns } from "./TableUI/Columns";
import ToolBar from "./TableUI/ToolBar";
import Table from "./TableUI/Table";

import useUtilisateurStore from "@/store/useUtilisateurStore";
import { LoaderCircle } from "lucide-react";
import { DataTablePagination } from "./TableUI/DataTablePagination";

export default function Utilisateur() {
  const { utilisateurs, fetchUtilisateurs } = useUtilisateurStore();
  const loading = useUtilisateurStore((state) => state.loading);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  // Handle window resizing for column visibility
  useEffect(() => {
    const updateColumnVisibility = () => {
      if (window.innerWidth <= 768) {
        setColumnVisibility({
          email_utilisateur: false,
          role_tilisateur: false,
          profile: false,
          Ntele_utilisateur: false,
          CIN_utilisateur: false,
          select: false,
          dateIntri_utilisateur:false,
        });
      } else {
        setColumnVisibility({
          email_utilisateur: true,
          role_tilisateur: true,
          profile: true,
          Ntele_utilisateur: true,
          CIN_utilisateur: true,
          select: true,
          dateIntri_utilisateur:true,
        });
      }
    };

    // Initialize column visibility on load
    updateColumnVisibility();

    // Add event listener for window resize
    window.addEventListener("resize", updateColumnVisibility);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", updateColumnVisibility);
    };
  }, []);

  const table = useReactTable({
    data: utilisateurs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );

  return (
    <div className="w-full px-4">
      <ToolBar table={table} />
      <Table table={table} columns={columns} />
      <div className="py-3">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
