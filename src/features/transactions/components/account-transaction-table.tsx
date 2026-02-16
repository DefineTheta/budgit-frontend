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
		accessorKey: "category",
		header: "Category",
		size: 196,
	},
	{
		accessorKey: "memo",
		header: "Memo",
		meta: {
			fluid: true,
		},
	},
	{
		accessorKey: "outflow",
		header: "Outflow",
		size: 120,
		cell: ({ row }) => {
			const amount = row.original.outflow / 100;
			const formattedAmount = new Intl.NumberFormat("en-AU", {
				style: "currency",
				currency: "AUD",
			}).format(amount);

			return formattedAmount;
		},
	},
	{
		accessorKey: "inflow",
		header: "Inflow",
		size: 120,
		cell: ({ row }) => {
			const amount = row.original.inflow / 100;
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
		},
		createMore = false,
	) => {
		console.log("Crete more", createMore);
		createTransactionMutation(
			{
				data: {
					date: data.date,
					account_id: accountId,
					payee_id: data.payee,
					category_id: data.category,
					memo: data.memo,
					outflow: data.outflow,
					inflow: data.inflow,
				},
			},
			{
				onSuccess: () => (createMore ? undefined : onCancelAdd?.()),
			},
		);
	};

	const handleTransactionsDelete = (rowsToDelete: Transaction[]) => {
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
							onSave={(data) =>
								updateTransactionMutation({
									transactionId: row.id,
									accountId,
									data,
								})
							}
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
