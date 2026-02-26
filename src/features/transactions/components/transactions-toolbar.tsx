import type { Table } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface TransactionsToolbarProps<TData> {
	table: Table<TData>;
	onDelete: (rows: TData[]) => void;
	onSelectionChange?: (rows: TData[]) => void;
}

export function TransactionsToolbar<TData>({
	table,
	onDelete,
	onSelectionChange,
}: TransactionsToolbarProps<TData>) {
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectionKeyRef = useRef("");
	const isOpen = selectedRows.length > 0;

	useEffect(() => {
		const selectionKey = selectedRows.map((row) => row.id).join("|");
		if (selectionKeyRef.current === selectionKey) return;

		selectionKeyRef.current = selectionKey;
		onSelectionChange?.(selectedRows.map((row) => row.original));
	}, [onSelectionChange, selectedRows]);

	if (!isOpen) return null;

	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-top-10 duration-200">
			<div className="bg-background text-background dark:bg-zinc-800 dark:text-white border shadow-lg rounded-full px-4 py-2 flex items-center justify-between gap-4">
				{/* Left Side: Combined clear button */}
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 rounded-full px-3 gap-2 hover:bg-background/20 hover:text-background"
						onClick={() => table.resetRowSelection()}
					>
						<span className="text-sm font-medium">{selectedRows.length} selected</span>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Separator */}
				<Separator orientation="vertical" className="h-6 bg-background/20" />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 rounded-full px-3 gap-2 hover:bg-background/20 hover:text-background"
						>
							<MoreHorizontal className="h-4 w-4" />
							<span className="text-sm font-medium">More</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onSelect={() => {
								const data = selectedRows.map((row) => row.original);
								onDelete(data);
							}}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
