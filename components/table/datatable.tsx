"use client"

import { exportToExcel } from "./export"

import {
    ColumnDef,
    SortingState,
    PaginationState,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { useState } from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchColumn: string
    searchPlaceholder?: string
    emptyMessage?: string
    exportFileName?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchColumn,
    searchPlaceholder = "Search...",
    emptyMessage = "No records found",
    exportFileName = "Export.xlsx",
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            columnFilters,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="overflow-hidden rounded-xl border border-[#1f3a40] bg-[#10272D]">

            {/* Toolbar */}

            <div className="flex items-center justify-between gap-3 p-3">

                <input
                    placeholder={searchPlaceholder}
                    value={
                        (table
                            .getColumn(searchColumn)
                            ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(e) =>
                        table
                            .getColumn(searchColumn)
                            ?.setFilterValue(e.target.value)
                    }
                    className="h-9 flex-1 rounded-md border border-[#1f3a40] bg-[#07191E] px-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#02F5A1]"
                />

                <button
                    onClick={() =>
                        exportToExcel(
                            table
                                .getFilteredRowModel()
                                .rows.map((row) => row.original),
                            exportFileName
                        )
                    }
                    className="h-9 rounded-md bg-[#02F5A1] px-3 text-xs font-medium text-black transition hover:bg-[#00d98f]"
                >
                    Export
                </button>

            </div>

            {/* Table */}

            <div className="overflow-x-auto">

                <table className="w-full text-xs">

                    <thead className="bg-[#07191E] text-white">

                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>

                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}

                                        {header.column.getIsSorted()
                                            ? header.column.getIsSorted() === "asc"
                                                ? " ↑"
                                                : " ↓"
                                            : null}
                                    </th>
                                ))}

                            </tr>
                        ))}

                    </thead>

                    <tbody>

                        {table.getRowModel().rows.length ? (

                            table.getRowModel().rows.map((row) => (

                                <tr
                                    key={row.id}
                                    className="border-t border-[#1f3a40] text-white transition hover:bg-[#16343B]"
                                >

                                    {row.getVisibleCells().map((cell) => (

                                        <td
                                            key={cell.id}
                                            className="whitespace-nowrap px-3 py-2 text-xs"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>

                                    ))}

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td
                                    colSpan={columns.length}
                                    className="p-6 text-center text-xs text-slate-400"
                                >
                                    {emptyMessage}
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

            {/* Pagination */}

            <div className="flex items-center justify-between border-t border-[#1f3a40] px-3 py-2">

                <div className="flex items-center gap-1">

                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-7 rounded-md bg-[#07191E] px-2.5 text-[11px] text-white disabled:opacity-30"
                    >
                        Prev
                    </button>

                    {(() => {
                        const currentPage =
                            table.getState().pagination.pageIndex + 1

                        const totalPages = table.getPageCount()

                        const pages = []

                        const start = Math.max(currentPage - 4, 1)
                        const end = Math.min(currentPage + 4, totalPages)

                        if (start > 1) {
                            pages.push(1)

                            if (start > 2) {
                                pages.push("...")
                            }
                        }

                        for (let i = start; i <= end; i++) {
                            pages.push(i)
                        }

                        if (end < totalPages) {
                            if (end < totalPages - 1) {
                                pages.push("...")
                            }

                            pages.push(totalPages)
                        }

                        return pages.map((page, index) =>
                            page === "..." ? (
                                <span
                                    key={index}
                                    className="px-1.5 text-[11px] text-slate-500"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={index}
                                    onClick={() =>
                                        table.setPageIndex(
                                            Number(page) - 1
                                        )
                                    }
                                    className={`h-7 min-w-7 rounded-md px-2 text-[11px] ${currentPage === page
                                            ? "bg-[#02F5A1] text-black"
                                            : "bg-[#07191E] text-white"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        )
                    })()}

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-7 rounded-md bg-[#07191E] px-2.5 text-[11px] text-white disabled:opacity-30"
                    >
                        Next
                    </button>

                </div>

                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) =>
                        table.setPageSize(Number(e.target.value))
                    }
                    className="h-7 rounded-md bg-[#07191E] px-2 text-[11px] text-white outline-none"
                >
                    {[10, 20, 30, 50].map((size) => (
                        <option
                            key={size}
                            value={size}
                        >
                            {size} rows
                        </option>
                    ))}
                </select>

            </div>

        </div>
    )
}