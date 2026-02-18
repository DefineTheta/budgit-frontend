import {
	type ColumnDef,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	type Row,
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
	getSubRows?: (originalRow: TData, index: number) => undefined | TData[];
	getRowCanExpand?: (row: Row<TData>) => boolean;
	enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
	defaultExpanded?: ExpandedState;
	prependedRow?: ReactNode;
	rowSelection?: Record<string, boolean>;
	setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
	renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode;
	onEdit?: (row: TData) => void;
	onRowDoubleClick?: (row: TData) => void;
	onCellDoubleClick?: (row: TData, columnId: string) => void;
	renderRow?: (row: TData) => React.ReactNode | null;
}

export function DataTable<TData, TValue>({
	disableHover = false,
	columns,
	data,
	getSubRows,
	getRowCanExpand,
	enableRowSelection = true,
	defaultExpanded,
	prependedRow,
	rowSelection,
	setRowSelection,
	renderToolbar,
	onEdit,
	onRowDoubleClick,
	onCellDoubleClick,
	renderRow,
}: DataTableProps<TData, TValue>) {
	const [expanded, setExpanded] = React.useState<ExpandedState>(defaultExpanded ?? {});
	const [hoveredExpandedGroupId, setHoveredExpandedGroupId] = React.useState<
		string | null
	>(null);

	const table = useReactTable({
		data,
		columns,
		getSubRows,
		getRowCanExpand,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onExpandedChange: setExpanded,
		onRowSelectionChange: setRowSelection,
		state: {
			expanded,
			rowSelection: rowSelection ?? {},
		},
		enableSubRowSelection: false,
		enableRowSelection,
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

									const directParentRow = row.getParentRow();
									const isLastSubRow =
										Boolean(directParentRow) &&
										row.index === (directParentRow?.subRows.length ?? 0) - 1;
									let parentRow = row.getParentRow();
									let hasSelectedParent = false;

									while (parentRow) {
										if (parentRow.getIsSelected()) {
											hasSelectedParent = true;
											break;
										}
										parentRow = parentRow.getParentRow();
									}

									let rootRow = row;
									let rootParent = row.getParentRow();

									while (rootParent) {
										rootRow = rootParent;
										rootParent = rootParent.getParentRow();
									}

									const isExpandedGroupRow =
										rootRow.getCanExpand() && rootRow.getIsExpanded();
									const isHoveredExpandedGroup =
										hoveredExpandedGroupId !== null &&
										hoveredExpandedGroupId === rootRow.id;

									return (
										<TableRow
											key={row.id}
											data-state={
												(row.getIsSelected() || hasSelectedParent) && "selected"
											}
											className={cn(
												"h-10",
												isHoveredExpandedGroup && "bg-muted/50",
												row.getCanExpand() && row.getIsExpanded() && "border-border/40",
												row.depth > 0 && !isLastSubRow && "border-border/40",
												disableHover && "hover:bg-transparent",
											)}
											onMouseEnter={() => {
												if (!isExpandedGroupRow) return;
												setHoveredExpandedGroupId(rootRow.id);
											}}
											onMouseLeave={() => {
												if (!isExpandedGroupRow) return;
												setHoveredExpandedGroupId((current) =>
													current === rootRow.id ? null : current,
												);
											}}
											onDoubleClick={
												onRowDoubleClick
													? () => onRowDoubleClick(row.original)
													: undefined
											}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													onDoubleClick={(event) => {
														if (!onCellDoubleClick) return;
														event.stopPropagation();
														onCellDoubleClick(row.original, cell.column.id);
													}}
												>
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
