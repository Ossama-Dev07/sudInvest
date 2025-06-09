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

import { LoaderCircle } from "lucide-react";
import { DataTablePagination } from "./TableUI/DataTablePagination";
import useAgoStore from "@/store/AgoStore";

export default function AGO() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const { fetchAgos, agos, loading } = useAgoStore();
   
  console.log("fetch all historiques", agos);
  useEffect(() => {
    const updateColumnVisibility = () => {
      if (window.innerWidth <= 768) {
        setColumnVisibility({
          client_nom: true,
          client_prenom: true,
          etapes: false,
          ran_amount:false,
          tpa_amount:false,
          dividendes_nets: false,
          annee: true,
        });
      } else {
        setColumnVisibility({
          client_nom: true,
          client_prenom: true,
          ran_amount: true,
          tpa_amount: true,
          dividendes_nets: true,
          etapes: true,
          annee: false,
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
    fetchAgos();
  }, [fetchAgos]);
  const table = useReactTable({
    data: agos,
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
      <ToolBar table={table} data={agos} />
      <Table table={table} columns={columns} />
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
