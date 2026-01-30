import { type ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/features/transactions/config/schemas";
import { useTransactions } from "@/features/transactions/api/get-transactions";
import { DataTable } from "@/components/ui/data-table";

interface AccountTransactionTableProps {
	accountId: string;
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
];

export const AccountTransactionTable = (props: AccountTransactionTableProps) => {
	const transactionsQuery = useTransactions({
		accountId: props.accountId,
	});

	const transactions = transactionsQuery.data;

	if (!transactions) return;

	return <DataTable columns={columns} data={transactions} />;
};
