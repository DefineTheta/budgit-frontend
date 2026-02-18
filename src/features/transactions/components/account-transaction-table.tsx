import type { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { useTransactions } from "@/features/transactions/api/get-transactions";
import type { Transaction } from "@/features/transactions/config/schemas";
import { useCreateTransaction } from "../api/create-transaction";
import { useDeleteTransactions } from "../api/delete-transaction";
import { useUpdateTransaction } from "../api/update-transaction";
import {
	EditableTransactionEditRow,
	EditableTransactionRow,
} from "./editable-transaction-row";
import { TransactionsToolbar } from "./transactions-toolbar";

interface AccountTransactionTableProps {
	accountId: string;
	isAddingTransaction?: boolean;
	onCancelAdd?: () => void;
}

type TransactionWithDraft = Transaction & { draft?: boolean };

const getTransactionCategory = (transaction: TransactionWithDraft) => {
	if (transaction.splits.length === 1) {
		return transaction.splits[0]?.category ?? "";
	}

	const categories = [...new Set(transaction.splits.map((split) => split.category))];
	return categories.join(", ");
};

const getTransactionMemo = (transaction: TransactionWithDraft) => {
	if (transaction.splits.length === 1) {
		return transaction.memo ?? "";
	}

	if (transaction.memo?.trim()) {
		return transaction.memo;
	}

	const splitMemos = [
		...new Set(
			transaction.splits
				.map((split) => split.memo?.trim())
				.filter((memo): memo is string => Boolean(memo)),
		),
	];

	return splitMemos.join("; ");
};

const columns: ColumnDef<TransactionWithDraft>[] = [
	{
		id: "select",
		header: ({ table }) => {
			const hasSelection = table.getFilteredSelectedRowModel().rows.length > 0;

			return (
				<Checkbox
					checked={hasSelection ? "indeterminate" : false}
					onCheckedChange={() => {
						if (hasSelection) {
							table.resetRowSelection();
							return;
						}

						table.toggleAllPageRowsSelected(true);
					}}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			);
		},
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false,
		size: 40,
	},
	{
		accessorKey: "date",
		header: "Date",
		size: 196,
		cell: ({ row }) => {
			return Intl.DateTimeFormat(undefined, {
				dateStyle: "short",
			}).format(row.original.date);
		},
	},
	{
		accessorKey: "payee",
		header: "Payee",
		size: 196,
	},
	{
		id: "category",
		accessorFn: (transaction) => getTransactionCategory(transaction),
		header: "Category",
		size: 256,
	},
	{
		id: "memo",
		accessorFn: (transaction) => getTransactionMemo(transaction),
		header: "Memo",
		meta: {
			fluid: true,
		},
	},
	{
		id: "outflow",
		accessorFn: (transaction) =>
			transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
		header: "Outflow",
		size: 120,
		cell: ({ getValue }) => {
			const amount = getValue<number>() / 100;
			const formattedAmount = new Intl.NumberFormat("en-AU", {
				style: "currency",
				currency: "AUD",
			}).format(amount);

			return formattedAmount;
		},
	},
	{
		id: "inflow",
		accessorFn: (transaction) => (transaction.amount > 0 ? transaction.amount : 0),
		header: "Inflow",
		size: 120,
		cell: ({ getValue }) => {
			const amount = getValue<number>() / 100;
			const formattedAmount = new Intl.NumberFormat("en-AU", {
				style: "currency",
				currency: "AUD",
			}).format(amount);

			return formattedAmount;
		},
	},
];

export const AccountTransactionTable = ({
	accountId,
	isAddingTransaction = false,
	onCancelAdd,
}: AccountTransactionTableProps) => {
	const [rowSelection, setRowSelection] = React.useState({});
	const [editingRowId, setEditingRowId] = React.useState<string | null>(null);

	const transactionsQuery = useTransactions({
		accountId,
	});

	const { mutate: createTransactionMutation } = useCreateTransaction();

	const { mutate: deleteTransactionMutation } = useDeleteTransactions({
		mutationConfig: {
			onSuccess: () => setRowSelection({}),
		},
	});

	const { mutate: updateTransactionMutation } = useUpdateTransaction({
		mutationConfig: {
			onSuccess: () => setEditingRowId(null),
		},
	});

	const transactions = transactionsQuery.data;

	if (!transactions) return null;

	const handleTransactionCreate = (
		data: {
			date: Date;
			payee: string;
			category: string;
			memo: string;
			outflow: number;
			inflow: number;
			splits?: {
				category: string;
				memo: string;
				outflow: number;
				inflow: number;
			}[];
		},
		createMore = false,
	) => {
		const amount = data.inflow > 0 ? data.inflow : data.outflow > 0 ? -data.outflow : 0;
		const splits =
			data.splits && data.splits.length > 0
				? data.splits.map((split) => ({
						category_id: split.category,
						amount:
							split.inflow > 0 ? split.inflow : split.outflow > 0 ? -split.outflow : 0,
						memo: split.memo.trim() ? split.memo : "",
					}))
				: [
						{
							category_id: data.category,
							amount,
							memo: "",
						},
				  ];
		const date = [
			data.date.getFullYear(),
			String(data.date.getMonth() + 1).padStart(2, "0"),
			String(data.date.getDate()).padStart(2, "0"),
		].join("-");

		createTransactionMutation(
			{
				data: {
					date,
					account_id: accountId,
					payee_id: data.payee,
					memo: data.memo.trim() ? data.memo : null,
					amount,
					cleared: false,
					splits,
				},
			},
			{
				onSuccess: () => (createMore ? undefined : onCancelAdd?.()),
			},
		);
	};

	const handleTransactionsDelete = (rowsToDelete: TransactionWithDraft[]) => {
		rowsToDelete.forEach((row) => {
			deleteTransactionMutation({
				data: row,
			});
		});
	};

	return (
		<div className="relative space-y-4">
			<DataTable
				columns={columns}
				data={transactions}
				prependedRow={
					isAddingTransaction && onCancelAdd ? (
						<EditableTransactionRow
							onCancel={onCancelAdd}
							onSave={handleTransactionCreate}
						/>
					) : undefined
				}
				rowSelection={rowSelection}
				setRowSelection={setRowSelection}
				onRowDoubleClick={(row) => setEditingRowId(row.id)}
				renderRow={(row) =>
					editingRowId === row.id ? (
						<EditableTransactionEditRow
							transaction={row}
							onCancel={() => setEditingRowId(null)}
							onSave={(data) => {
								const amount =
									data.inflow > 0 ? data.inflow : data.outflow > 0 ? -data.outflow : 0;
								const splits =
									data.splits && data.splits.length > 0
										? data.splits.map((split) => ({
												category_id: split.category_id,
												amount:
													split.inflow > 0
														? split.inflow
														: split.outflow > 0
															? -split.outflow
															: 0,
												memo: split.memo.trim() ? split.memo : "",
										}))
										: [
												{
													category_id: data.category_id,
													amount,
													memo: "",
												},
										  ];
								const date = [
									data.date.getFullYear(),
									String(data.date.getMonth() + 1).padStart(2, "0"),
									String(data.date.getDate()).padStart(2, "0"),
								].join("-");

								return updateTransactionMutation({
									transactionId: row.id,
									accountId,
									data: {
										date,
										payee_id: data.payee_id,
										memo: data.memo,
										amount,
										splits,
									},
								});
							}}
						/>
					) : null
				}
				renderToolbar={(table) => (
					<TransactionsToolbar table={table} onDelete={handleTransactionsDelete} />
				)}
			/>
		</div>
	);
};
