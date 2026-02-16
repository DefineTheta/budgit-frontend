import type { Table } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TransactionsToolbarProps<TData extends { inflow: number; outflow: number }> {
	table: Table<TData>;
	onDelete: (rows: TData[]) => void;
}

export function TransactionsToolbar<TData extends { inflow: number; outflow: number }>({
	table,
	onDelete,
}: TransactionsToolbarProps<TData>) {
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const isOpen = selectedRows.length > 0;
	const selectedTotal = selectedRows.reduce(
		(sum, row) => sum + row.original.inflow - row.original.outflow,
		0,
	);
	const formattedSelectedTotal = new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
	}).format(selectedTotal / 100);

	if (!isOpen) return null;

	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-top-10 duration-200">
			<div className="bg-background text-background dark:bg-zinc-800 dark:text-white border shadow-lg rounded-full px-4 py-2 flex items-center justify-between gap-4">
				{/* Left Side: Count & Clear */}
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium pl-2">{selectedRows.length} selected</span>
					<span className="text-sm font-medium">{formattedSelectedTotal}</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 rounded-full hover:bg-background/20 hover:text-background"
						onClick={() => table.resetRowSelection()}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Separator */}
				<Separator orientation="vertical" className="h-6 bg-background/20" />

				{/* Right Side: Actions */}
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2 hover:bg-red-500/20 hover:text-red-400 text-red-500"
						onClick={() => {
							// Extract the original data objects and pass them up
							const data = selectedRows.map((row) => row.original);
							onDelete(data);
						}}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
}
