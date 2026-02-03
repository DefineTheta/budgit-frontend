import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useTransactions } from "@/features/transactions/api/get-transactions";
import type { Transaction } from "@/features/transactions/config/schemas";
import { EditableTransactionRow } from "./editable-transaction-row";

interface AccountTransactionTableProps {
	accountId: string;
	isAddingTransaction?: boolean;
	onCancelAdd?: () => void;
}

type TransactionWithDraft = Transaction & { draft?: boolean };

const columns: ColumnDef<TransactionWithDraft>[] = [
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => {
			return new Date(row.getValue("date")).toLocaleDateString();
		},
	},
	{
		accessorKey: "payee",
		header: "Payee",
	},
	{
		accessorKey: "category",
		header: "Category",
	},
	{
		accessorKey: "memo",
		header: "Memo",
	},
	{
		accessorKey: "outflow",
		header: "Outflow",
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
		cell: ({ row }) => {
			const amount = row.original.inflow / 100;
			const formattedAmount = new Intl.NumberFormat("en-AU", {
				style: "currency",
				currency: "AUD",
			}).format(amount);

			return formattedAmount;
		},
	},
	{
		id: "actions",
		header: "",
		cell: () => null,
	},
];

export const AccountTransactionTable = ({
	accountId,
	isAddingTransaction = false,
	onCancelAdd,
}: AccountTransactionTableProps) => {
	const transactionsQuery = useTransactions({
		accountId,
	});

	const transactions = transactionsQuery.data;

	if (!transactions) return null;

	return (
		<DataTable
			columns={columns}
			data={transactions}
			prependedRow={
				isAddingTransaction && onCancelAdd ? (
					<EditableTransactionRow onCancel={onCancelAdd} />
				) : undefined
			}
		/>
	);
};
