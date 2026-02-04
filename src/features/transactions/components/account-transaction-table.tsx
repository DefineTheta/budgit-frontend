import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useTransactions } from "@/features/transactions/api/get-transactions";
import type { Transaction } from "@/features/transactions/config/schemas";
import { EditableTransactionRow } from "./editable-transaction-row";
import { useCreateTransaction } from "../api/create-transaction";
import { Checkbox } from "@/components/ui/checkbox";

interface AccountTransactionTableProps {
	accountId: string;
	isAddingTransaction?: boolean;
	onCancelAdd?: () => void;
}

type TransactionWithDraft = Transaction & { draft?: boolean };

const columns: ColumnDef<TransactionWithDraft>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="translate-y-[2px]"
			/>
		),
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
	const transactionsQuery = useTransactions({
		accountId,
	});

	const { mutate: createTransactionMutation, isPending: creatingTransaction } =
		useCreateTransaction({
			mutationConfig: {
				onSuccess: () => onCancelAdd?.(),
			},
		});

	const transactions = transactionsQuery.data;

	if (!transactions) return null;

	const handleTransactionCreate = (data: {
		date: Date;
		payee: string;
		category: string;
		memo: string;
		outflow: number;
		inflow: number;
	}) => {
		createTransactionMutation({
			data: {
				date: data.date,
				account_id: accountId,
				payee_id: data.payee,
				category_id: data.category,
				memo: data.memo,
				outflow: data.outflow,
				inflow: data.inflow,
			},
		});
	};

	return (
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
		/>
	);
};
