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

import { LoaderCircle } from "lucide-react";
import { DataTablePagination } from "./DataTablePagination";
import useClientStore from "@/store/useClientStore";


export default function ArchiveClient() {
  const { archivedClients, fetchArchivedClients, isLoading } =useClientStore();
 

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  console.log("archiveClient",archivedClients)
  useEffect(() => {
    fetchArchivedClients();
  }, [fetchArchivedClients]);

  useEffect(() => {
    const updateColumnVisibility = () => {
      if (window.innerWidth <= 768) {
        setColumnVisibility({
   
          email: false,
          profile: false,
          telephone: false,
          select: false,
          date_collaboration: false,
          CIN_client: false,
          rc: false,
          adresse: false,
          datecreation: false,
          ice: false,
          id_fiscal: false,
          taxe_profes: false,
        });
      } else {
        setColumnVisibility({

          email: false,
          profile: true,
          telephone: true,
          select: true,
          date_collaboration: false,
          CIN_client: false,
          rc: false,
          adresse: false,
          datecreation: false,
          ice: false,
          id_fiscal: false,
          taxe_profes: false,
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
    data: archivedClients ,
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

  if (isLoading)
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
