import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
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

type CategoryActivityHoverCardProps = {
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

export const CategoryActivityHoverCard = ({
	categoryId,
	categoryName,
	activityAmount,
}: CategoryActivityHoverCardProps) => {
	const [open, setOpen] = useState(false);

	const columns = useMemo<ColumnDef<Transaction>[]>(
		() => [
			{
				accessorKey: "account",
				header: "Account",
				cell: ({ row }) => row.original.account ?? "-",
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
					const amount = getSignedAmount(row.original.amount);
					return <div className="text-right">{currencyFormatter.format(amount)}</div>;
				},
			},
		],
		[],
	);

	const categoryTransactionsQuery = useCategoryTransactions({
		categoryId,
		queryConfig: {
			enabled: open,
		},
	});

	const formattedActivityAmount = currencyFormatter.format(activityAmount);
	const transactionCount = categoryTransactionsQuery.data?.length ?? 0;

	const table = useReactTable({
		data: categoryTransactionsQuery.data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<HoverCard open={open} onOpenChange={setOpen} openDelay={500}>
			<HoverCardTrigger asChild>
				<button
					type="button"
					className="w-full cursor-help text-right underline underline-offset-4"
				>
					{formattedActivityAmount}
				</button>
			</HoverCardTrigger>
			<HoverCardContent className="w-[500px] p-0" align="end">
				<div className="px-4 pt-3 pb-2">
					<p className="text-base font-semibold">{categoryName}</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{categoryTransactionsQuery.isLoading
							? "Loading transactions..."
							: `${transactionCount} ${transactionCount === 1 ? "transaction" : "transactions"}`}
					</p>
				</div>
				{categoryTransactionsQuery.isLoading ? (
					<div className="px-4 pb-4 text-sm text-muted-foreground">Loading...</div>
				) : categoryTransactionsQuery.isError ? (
					<div className="px-4 pb-4 text-sm text-destructive">
						Could not load transactions.
					</div>
				) : (
					<div className="max-h-72 overflow-auto px-2 pb-2">
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
			</HoverCardContent>
		</HoverCard>
	);
};
