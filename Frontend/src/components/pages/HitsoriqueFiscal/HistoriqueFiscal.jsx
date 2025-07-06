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
import { Button } from "@/components/ui/button";

import { LoaderCircle } from "lucide-react";
import { DataTablePagination } from "./TableUI/DataTablePagination";
import useHistoriqueFiscalStore from "@/store/HistoriqueFiscalStore";

export default function HistoriqueFiscal() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const {
    fetchHistoriques,
    historiques,
    loading,
    getFilteredHistoriques,
    stats,
  } = useHistoriqueFiscalStore();

  console.log("fetch all historiques fiscaux", historiques);
  console.log("stats", stats);

  useEffect(() => {
    const updateColumnVisibility = () => {
      if (window.innerWidth <= 768) {
        // Mobile view - show only essential columns
        setColumnVisibility({
          client_display: true,
          client_type: false,
          annee_fiscal: true,
          progress_percentage: false,
          statut_global: true,
          datecreation: false,
        });
      } else {
        // Desktop view - show most important columns
        setColumnVisibility({
          client_display: true,
          client_type: true,
          annee_fiscal: true,
          progress_percentage: true,
          statut_global: true,
          datecreation: true,
        });
      }
    };

    updateColumnVisibility();

    // Add event listener for window resize
    window.addEventListener("resize", updateColumnVisibility);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", updateColumnVisibility);
    };
  }, []);

  useEffect(() => {
    fetchHistoriques();
  }, [fetchHistoriques]);

  const table = useReactTable({
    data: historiques,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <ToolBar table={table} data={historiques} />
      <Table table={table} columns={columns} />
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
