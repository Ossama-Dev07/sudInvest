"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { data } from "./TableUI/Data";
import { columns } from "./TableUI/Columns";
import ToolBar from "./TableUI/ToolBar";
import Table from "./TableUI/Table";
import { Button } from "@/components/ui/button";
import useClientStore from "@/store/useClientStore";
import { LoaderCircle } from "lucide-react";
import { DataTablePagination } from "./TableUI/DataTablePagination";

export default function Client() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const { clients, fetchClients, isLoading } = useClientStore();

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
          email_2: false,
          telephone2: false,

        });
      } else {
        setColumnVisibility({
          email: true,
          profile: true,
          telephone: true,
          select: true,
          date_collaboration: true,
          CIN_client: false,
          rc: false,
          adresse: false,
          datecreation: false,
          ice: false,
          id_fiscal: false,
          taxe_profes: false,
          email_2: false,
          telephone2: false,
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

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  const table = useReactTable({
    data: clients,
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
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
