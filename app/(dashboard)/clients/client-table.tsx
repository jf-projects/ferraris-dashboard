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
}


export function ClientTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])


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
        <div className="overflow-hidden rounded-2xl border border-[#1f3a40] bg-[#10272D]">

            <div className="flex items-center justify-between gap-4 p-4">

                <input
                    placeholder="Search clients..."
                    value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("fullName")?.setFilterValue(e.target.value)}
                    className="flex-1 rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                />

                <button
                    onClick={() => exportToExcel(table.getFilteredRowModel().rows.map(row => row.original))}
                    className="rounded-lg bg-[#02F5A1] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#00d98f]"
                >
                    Export Excel
                </button>

            </div>


            <table className="w-full">

                <thead className="bg-[#07191E] text-white">

                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="cursor-pointer p-4 text-left text-sm font-semibold"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() ? header.column.getIsSorted() === "asc" ? " ↑" : " ↓" : null}
                                </th>
                            ))}
                        </tr>
                    ))}

                </thead>


                <tbody>

                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-t border-[#1f3a40] text-white transition hover:bg-[#16343B]">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-4 text-sm">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                                No clients found
                            </td>
                        </tr>
                    )}

                </tbody>

            </table>


            <div className="flex items-center justify-between p-4 text-white">

                <div className="flex gap-2">

                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-lg bg-[#07191E] px-3 py-2 text-sm disabled:opacity-40"
                    >
                        Prev
                    </button>


                    {(() => {

                        const currentPage = table.getState().pagination.pageIndex + 1
                        const totalPages = table.getPageCount()
                        const pages = []

                        const start = Math.max(currentPage - 4, 1)
                        const end = Math.min(currentPage + 4, totalPages)

                        if (start > 1) {
                            pages.push(1)
                            if (start > 2) pages.push("...")
                        }

                        for (let i = start; i <= end; i++) {
                            pages.push(i)
                        }

                        if (end < totalPages) {
                            if (end < totalPages - 1) pages.push("...")
                            pages.push(totalPages)
                        }

                        return pages.map((page, index) => (
                            page === "..." ? (
                                <span key={index} className="px-3 py-2 text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={index}
                                    onClick={() => table.setPageIndex(Number(page) - 1)}
                                    className={`rounded-lg px-3 py-2 text-sm ${currentPage === page ? "bg-[#02F5A1] text-black" : "bg-[#07191E]"}`}
                                >
                                    {page}
                                </button>
                            )
                        ))

                    })()}


                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-lg bg-[#07191E] px-3 py-2 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>


                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="rounded-lg bg-[#07191E] px-3 py-2 text-sm text-white"
                >
                    {[10, 20, 30, 50].map((size) => (
                        <option key={size} value={size}>
                            {size} rows
                        </option>
                    ))}
                </select>

            </div>

        </div>
    )
}