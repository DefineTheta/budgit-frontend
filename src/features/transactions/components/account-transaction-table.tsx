import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, CircleCheck } from "lucide-react";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { useTransactions } from "@/features/transactions/api/get-transactions";
import type { Transaction } from "@/features/transactions/config/schemas";
import { type User, useUsers } from "@/features/users/api/get-users";
import { formatCurrency } from "@/utils/currency";
import { useCreateTransaction } from "../api/create-transaction";
import { useDeleteTransactions } from "../api/delete-transaction";
import { useUpdateTransaction } from "../api/update-transaction";
import {
	EditableTransactionEditRow,
	EditableTransactionRow,
} from "./editable-transaction-row";
import { TransactionShareControl } from "./transaction-share-control";
import { TransactionsToolbar } from "./transactions-toolbar";

interface AccountTransactionTableProps {
	accountId: string;
	isAddingTransaction?: boolean;
	onCancelAdd?: () => void;
}

type TransactionWithDraft = Transaction & { draft?: boolean };
type TransactionTableRow = TransactionWithDraft & {
	isSplitSubRow?: boolean;
	parentTransactionId?: string;
	splitId?: string;
	subRows?: TransactionTableRow[];
};

type EditFocusTarget = {
	field: "date" | "payee" | "category" | "memo" | "outflow" | "inflow";
	splitId?: string;
};

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

	return "";
};

const toApiSplits = (splits: Transaction["splits"]) =>
	splits.map((split) => ({
		category_id: split.category_id,
		amount: split.amount,
		memo: split.memo,
	}));

const getTransactionSharedUserIds = (transaction: TransactionTableRow) => {
	const debtorUserIds = transaction.splits
		.map((split) => split.debtor_user_id)
		.filter((id): id is string => Boolean(id));

	return [...new Set(debtorUserIds)];
};

const getColumns = ({
	users,
	onShare,
	onToggleCleared,
	isUpdatingCleared,
}: {
	users: User[];
	onShare: (row: TransactionTableRow, splitWith: string[]) => void;
	onToggleCleared: (row: TransactionTableRow) => void;
	isUpdatingCleared: boolean;
}): ColumnDef<TransactionTableRow>[] => [
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
		cell: ({ row }) =>
			row.original.isSplitSubRow ? null : (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="translate-y-[2px]"
				/>
			),
		enableSorting: false,
		enableHiding: false,
		size: 32,
	},
	{
		accessorKey: "date",
		header: "Date",
		size: 128,
		cell: ({ row }) => {
			if (row.original.isSplitSubRow) return null;
			return Intl.DateTimeFormat(undefined, {
				dateStyle: "short",
			}).format(row.original.date);
		},
	},
	{
		accessorKey: "payee",
		header: "Payee",
		cell: ({ row }) => (row.original.isSplitSubRow ? null : row.original.payee),
		size: 180,
	},
	{
		id: "category",
		accessorFn: (transaction) => getTransactionCategory(transaction),
		header: "Category",
		cell: ({ row }) => {
			const splitCount = row.original.splits.length;

			if (row.getCanExpand()) {
				return (
					<button
						type="button"
						onClick={row.getToggleExpandedHandler()}
						className="inline-flex items-center gap-1 text-left"
					>
						{row.getIsExpanded() ? (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
						)}
						<span>{`Split (${splitCount})`}</span>
					</button>
				);
			}

			if (row.original.isSplitSubRow) {
				return <div className="pl-5">{getTransactionCategory(row.original)}</div>;
			}

			return getTransactionCategory(row.original);
		},
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
		header: () => <div className="text-right">Outflow</div>,
		size: 96,
		cell: ({ getValue }) => (
			<div className="text-right">{formatCurrency(getValue<number>())}</div>
		),
	},
	{
		id: "inflow",
		accessorFn: (transaction) => (transaction.amount > 0 ? transaction.amount : 0),
		header: () => <div className="text-right">Inflow</div>,
		size: 96,
		cell: ({ getValue }) => (
			<div className="text-right">{formatCurrency(getValue<number>())}</div>
		),
	},
	{
		id: "cleared",
		header: "Cleared",
		size: 72,
		cell: ({ row }) => {
			if (row.original.isSplitSubRow) return null;

			const isCleared = row.original.cleared;

			return (
				<div className="flex flex-row justify-center">
					<button
						type="button"
						onClick={() => onToggleCleared(row.original)}
						disabled={isUpdatingCleared}
						aria-label={
							isCleared ? "Mark transaction uncleared" : "Mark transaction cleared"
						}
						className="inline-flex cursor-pointer h-8 w-8 items-center justify-center"
					>
						<CircleCheck
							className={
								isCleared
									? "h-5 w-5 fill-emerald-700 text-white"
									: "h-5 w-5 text-muted-foreground"
							}
						/>
					</button>
				</div>
			);
		},
	},
	{
		id: "share",
		header: "Share",
		size: 80,
		cell: ({ row }) => {
			if (row.original.isSplitSubRow) return null;
			const sharedUserIds = getTransactionSharedUserIds(row.original);

			return (
				<TransactionShareControl
					users={users}
					splitWith={sharedUserIds}
					showPlus={false}
					disabled
					onChange={(splitWith) => onShare(row.original, splitWith)}
				/>
			);
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
	const [editFocusTarget, setEditFocusTarget] = React.useState<EditFocusTarget | null>(
		null,
	);

	const transactionsQuery = useTransactions({
		accountId,
	});
	const usersQuery = useUsers();

	const { mutate: createTransactionMutation } = useCreateTransaction();

	const { mutate: deleteTransactionMutation } = useDeleteTransactions({
		mutationConfig: {
			onSuccess: () => setRowSelection({}),
		},
	});

	const { mutate: updateTransactionMutation, isPending: isUpdatingTransaction } =
		useUpdateTransaction({
			mutationConfig: {
				onSuccess: () => {
					setEditingRowId(null);
					setEditFocusTarget(null);
				},
			},
		});

	const transactions = transactionsQuery.data;
	const users = usersQuery.data ?? [];

	if (!transactions) return null;

	const columns = getColumns({
		users,
		isUpdatingCleared: isUpdatingTransaction,
		onToggleCleared: (row) => {
			updateTransactionMutation({
				transactionId: row.id,
				accountId,
				data: {
					date: [
						row.date.getFullYear(),
						String(row.date.getMonth() + 1).padStart(2, "0"),
						String(row.date.getDate()).padStart(2, "0"),
					].join("-"),
					payee_id: row.payee_id,
					memo: row.memo,
					amount: row.amount,
					splits: toApiSplits(row.splits),
					splitWith: getTransactionSharedUserIds(row),
					cleared: !row.cleared,
				},
			});
		},
		onShare: (row, splitWith) => {
			updateTransactionMutation({
				transactionId: row.id,
				accountId,
				data: {
					cleared: row.cleared,
					date: [
						row.date.getFullYear(),
						String(row.date.getMonth() + 1).padStart(2, "0"),
						String(row.date.getDate()).padStart(2, "0"),
					].join("-"),
					payee_id: row.payee_id,
					memo: row.memo,
					amount: row.amount,
					splits: toApiSplits(row.splits),
					splitWith,
				},
			});
		},
	});

	const transactionRows: TransactionTableRow[] = transactions.map((transaction) => {
		if (transaction.splits.length <= 1) {
			return transaction;
		}

		return {
			...transaction,
			subRows: transaction.splits.map((split) => ({
				...transaction,
				id: `${transaction.id}-${split.id}`,
				amount: split.amount,
				memo: split.memo,
				splits: [split],
				isSplitSubRow: true,
				parentTransactionId: transaction.id,
				splitId: split.id,
			})),
		};
	});

	const defaultExpanded = transactionRows.reduce<Record<string, boolean>>(
		(acc, row, index) => {
			if (row.splits.length > 1) {
				acc[String(index)] = true;
			}
			return acc;
		},
		{},
	);

	const handleTransactionCreate = (
		data: {
			date: Date;
			payee: string;
			category: string;
			memo: string;
			outflow: number;
			inflow: number;
			cleared: boolean;
			splitWith: string[];
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
					cleared: data.cleared,
					splitWith: data.splitWith,
					splits,
				},
			},
			{
				onSuccess: () => (createMore ? undefined : onCancelAdd?.()),
			},
		);
	};

	const handleTransactionsDelete = (rowsToDelete: TransactionTableRow[]) => {
		rowsToDelete
			.filter((row) => !row.isSplitSubRow)
			.forEach((row) => {
				deleteTransactionMutation({
					data: row,
				});
			});
	};

	return (
		<div className="relative space-y-4">
			<DataTable
				columns={columns}
				data={transactionRows}
				getSubRows={(row) => row.subRows}
				getRowCanExpand={(row) =>
					row.original.splits.length > 1 && !row.original.isSplitSubRow
				}
				enableRowSelection={(row) => !row.original.isSplitSubRow}
				defaultExpanded={defaultExpanded}
				prependedRow={
					isAddingTransaction && onCancelAdd ? (
						<EditableTransactionRow
							users={users}
							onCancel={onCancelAdd}
							onSave={handleTransactionCreate}
						/>
					) : undefined
				}
				rowSelection={rowSelection}
				setRowSelection={setRowSelection}
				onRowDoubleClick={(row) => {
					if (row.isSplitSubRow) return;
					setEditFocusTarget({ field: "date" });
					setEditingRowId(row.id);
				}}
				onCellDoubleClick={(row, columnId) => {
					if (columnId === "select") return;

					const field =
						columnId === "date" ||
						columnId === "payee" ||
						columnId === "category" ||
						columnId === "memo" ||
						columnId === "outflow" ||
						columnId === "inflow"
							? columnId
							: "date";

					setEditFocusTarget({
						field,
						splitId: row.isSplitSubRow ? row.splitId : undefined,
					});
					setEditingRowId(
						row.isSplitSubRow ? (row.parentTransactionId ?? row.id) : row.id,
					);
				}}
				renderRow={(row) =>
					row.isSplitSubRow && editingRowId === row.parentTransactionId ? (
						false
					) : editingRowId === row.id ? (
						<EditableTransactionEditRow
							transaction={row}
							users={users}
							onCancel={() => {
								setEditingRowId(null);
								setEditFocusTarget(null);
							}}
							initialFocus={editFocusTarget}
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
						cleared: data.cleared,
						splitWith: data.splitWith,
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
