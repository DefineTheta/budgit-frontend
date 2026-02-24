import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCategoryTransactions } from "@/features/transactions/api/get-category-transactions";
import type { Transaction } from "@/features/transactions/config/schemas";

type CategoryActivityPopoverProps = {
	categoryId: string;
	categoryName: string;
	activityAmount: number;
};

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

const getSignedAmount = (amount: number) => {
	return amount / 100;
};

const getCategorySplitTotal = (transaction: Transaction) => {
	return transaction.splits.reduce((sum, split) => sum + split.amount, 0);
};

const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: "account",
		header: "Account",
		cell: ({ row }) => row.original.account ?? "-",
		filterFn: (row, columnId, filterValue: string[]) => {
			if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
			const account = row.getValue<string | null | undefined>(columnId);
			if (!account) return true;
			return !filterValue.includes(account);
		},
	},
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
	},
	{
		accessorKey: "payee",
		header: "Payee",
	},
	{
		id: "amount",
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row }) => {
			const amount = getSignedAmount(getCategorySplitTotal(row.original));
			return <div className="text-right">{currencyFormatter.format(amount)}</div>;
		},
	},
];

export const CategoryActivityPopover = ({
	categoryId,
	categoryName,
	activityAmount,
}: CategoryActivityPopoverProps) => {
	const [open, setOpen] = useState(false);
	const [removedAccounts, setRemovedAccounts] = useState<Set<string>>(new Set());

	const categoryTransactionsQuery = useCategoryTransactions({
		categoryId,
		queryConfig: {
			enabled: open,
		},
	});

	const formattedActivityAmount = currencyFormatter.format(activityAmount);
	const fallbackTransactions = React.useMemo(() => [], []);
	const allTransactions = categoryTransactionsQuery.data ?? fallbackTransactions;
	const accountNames = Array.from(
		new Set(
			allTransactions
				.map((transaction) => transaction.account)
				.filter((account): account is string => Boolean(account)),
		),
	);
	const visibleAccountNames = accountNames.filter(
		(accountName) => !removedAccounts.has(accountName),
	);
	const hiddenAccountNames = accountNames.filter((accountName) =>
		removedAccounts.has(accountName),
	);
	const columnFilters = React.useMemo(
		() => [{ id: "account", value: Array.from(removedAccounts) }],
		[removedAccounts],
	);

	const table = useReactTable({
		data: allTransactions,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			columnFilters,
		},
	});

	const transactionCount = table.getFilteredRowModel().rows.length;
	const filteredTotalAmount = table
		.getFilteredRowModel()
		.rows.reduce((sum, row) => sum + getCategorySplitTotal(row.original), 0);
	const formattedFilteredTotalAmount = currencyFormatter.format(
		getSignedAmount(filteredTotalAmount),
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="w-full cursor-help text-right underline underline-offset-4"
				>
					{formattedActivityAmount}
				</button>
			</PopoverTrigger>
			{open && (
				<PopoverContent className="w-[500px] p-0" align="end">
					<div className="px-4 pt-3 pb-2">
						<p className="text-base font-semibold">{categoryName}</p>
						<div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
							{categoryTransactionsQuery.isLoading ? (
								<p>Loading transactions...</p>
							) : (
								<>
									<p className="font-semibold">{formattedFilteredTotalAmount}</p>
									<p>|</p>
									<p>{`${transactionCount} ${transactionCount === 1 ? "transaction" : "transactions"}`}</p>
								</>
							)}
						</div>
					</div>
					{categoryTransactionsQuery.isLoading ? (
						<div className="px-4 pb-4 text-sm text-muted-foreground">Loading...</div>
					) : categoryTransactionsQuery.isError ? (
						<div className="px-4 pb-4 text-sm text-destructive">
							Could not load transactions.
						</div>
					) : (
						<div className="max-h-72 overflow-auto px-2 pb-2">
							{accountNames.length > 0 && (
								<div className="my-3 flex flex-wrap gap-1 px-2">
									{visibleAccountNames.map((accountName) => (
										<Badge key={accountName} variant="secondary" className="gap-1 pr-1">
											<span>{accountName}</span>
											<button
												type="button"
												aria-label={`Remove ${accountName}`}
												className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
												onClick={(event) => {
													event.stopPropagation();
													setRemovedAccounts((current) =>
														new Set(current).add(accountName),
													);
												}}
											>
												<X className="size-3" />
											</button>
										</Badge>
									))}
									{hiddenAccountNames.map((accountName) => (
										<Badge
											key={`hidden-${accountName}`}
											variant="secondary"
											className="gap-1 pr-1 opacity-60"
										>
											<span>{accountName}</span>
											<button
												type="button"
												aria-label={`Add ${accountName}`}
												className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
												onClick={(event) => {
													event.stopPropagation();
													setRemovedAccounts((current) => {
														const next = new Set(current);
														next.delete(accountName);
														return next;
													});
												}}
											>
												<Plus className="size-3" />
											</button>
										</Badge>
									))}
								</div>
							)}
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows.length ? (
										table.getRowModel().rows.map((row) => (
											<TableRow key={row.id}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="text-center text-muted-foreground"
											>
												No transactions.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</PopoverContent>
			)}
		</Popover>
	);
};
