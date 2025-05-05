"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { columns } from "./Columns";
import ToolBar from "./ToolBar";
import Table from "./Table";

import useUtilisateurStore from "@/store/useUtilisateurStore";
import { LoaderCircle } from "lucide-react";
import { DataTablePagination } from "./DataTablePagination";

export default function ArchiveUtilisateur() {
  const { archivedUtilisateurs, fetchArchivedUtilisateurs, loading } =useUtilisateurStore();

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    fetchArchivedUtilisateurs();
  }, [fetchArchivedUtilisateurs]);

  useEffect(() => {
    const updateColumnVisibility = () => {
      if (window.innerWidth <= 768) {
        setColumnVisibility({
   
          role_utilisateur: false,
          profile: false,
          Ntele_utilisateur: false,
          CIN_utilisateur: false,
          select: false,
          dateIntri_utilisateur: false,
          archived_at:false,
        });
      } else {
        setColumnVisibility({

          role_utilisateur: true,
          profile: true,
          Ntele_utilisateur: true,
          CIN_utilisateur: true,
          select: true,
          dateIntri_utilisateur: true,
          archived_at: true,
        });
      }
    };

    updateColumnVisibility();

    window.addEventListener("resize", updateColumnVisibility);

    return () => {
      window.removeEventListener("resize", updateColumnVisibility);
    };
  }, []);

  const table = useReactTable({
    data: archivedUtilisateurs,
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
