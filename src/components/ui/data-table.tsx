import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type Table as TanstackTable,
	useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
	disableHover?: boolean;
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	prependedRow?: ReactNode;
	rowSelection?: Record<string, boolean>;
	setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
	renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode;
	onEdit?: (row: TData) => void;
	onRowDoubleClick?: (row: TData) => void;
	renderRow?: (row: TData) => React.ReactNode | null;
}

export function DataTable<TData, TValue>({
	disableHover = false,
	columns,
	data,
	prependedRow,
	rowSelection,
	setRowSelection,
	renderToolbar,
	onEdit,
	onRowDoubleClick,
	renderRow,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection: rowSelection ?? {},
		},
		enableRowSelection: true,
		meta: {
			onEdit,
		},
	});

	return (
		<div className="space-y-4">
			{renderToolbar && renderToolbar(table)}

			<div className="rounded-md border">
				<Table className="table-fixed w-full">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const isFluid = header.column.columnDef.meta?.fluid;

									return (
										<TableHead
											key={header.id}
											style={{
												width: isFluid ? "100%" : `${header.getSize()}px`,
												minWidth: isFluid ? "200px" : undefined,
											}}
											className="font-medium"
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{prependedRow}
						{table.getRowModel().rows?.length
							? table.getRowModel().rows.map((row) => {
									const customRow = renderRow?.(row.original);
									if (customRow !== undefined && customRow !== null) {
										return <React.Fragment key={row.id}>{customRow}</React.Fragment>;
									}

									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											className={cn("h-10", disableHover && "hover:bg-transparent")}
											onDoubleClick={
												onRowDoubleClick
													? () => onRowDoubleClick(row.original)
													: undefined
											}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									);
								})
							: !prependedRow && (
									<TableRow>
										<TableCell colSpan={columns.length} className="h-24 text-center">
											No results.
										</TableCell>
									</TableRow>
								)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
