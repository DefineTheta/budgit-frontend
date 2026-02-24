import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Equal, FilePlusCorner, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/features/accounts/api/get-account";
import { useTransactions } from "@/features/transactions/api/get-transactions";
import { AccountTransactionTable } from "@/features/transactions/components/account-transaction-table";
import { AddTransactionsFromFileModal } from "@/features/transactions/components/add-transactions-from-file-modal";
import { formatCurrency } from "@/utils/currency";

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId } = Route.useParams();
	const [isAddingTransaction, setIsAddingTransaction] = useState(false);
	const [isAddingFromFile, setIsAddingFromFile] = useState(false);

	const accountQuery = useAccount({
		id: accountId,
	});
	const transactionsQuery = useTransactions({
		accountId,
	});

	const account = accountQuery.data;
	const transactions = transactionsQuery.data ?? [];
	const clearedBalance = transactions
		.filter((transaction) => transaction.cleared)
		.reduce((sum, transaction) => sum + transaction.amount, 0);
	const unclearedBalance = transactions
		.filter((transaction) => !transaction.cleared)
		.reduce((sum, transaction) => sum + transaction.amount, 0);
	const totalBalance = clearedBalance + unclearedBalance;

	if (!account) return null;

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-4">{account.name}</h2>
			<div className="flex">
				<Badge variant="secondary">
					<CreditCard data-icon="inline-start" className="mr-1" size={20} />
					Credit Card
				</Badge>
			</div>
			<div className="my-5 flex items-start border p-4 bg-background border-gray-300 rounded-lg">
				<div className="flex flex-col">
					<span className="text-3xl font-semibold text-emerald-700">
						{formatCurrency(clearedBalance)}
					</span>
					<span className="text-xs text-muted-foreground">Cleared</span>
				</div>
				<Plus className="mx-3 mt-3 h-4 w-4 text-muted-foreground" />
				<div className="flex flex-col">
					<span className="text-3xl font-semibold text-black">
						{formatCurrency(unclearedBalance)}
					</span>
					<span className="text-xs text-muted-foreground">Uncleared</span>
				</div>
				<Equal className="mx-3 mt-3 h-4 w-4 text-muted-foreground" />
				<div className="flex flex-col">
					<span className="text-3xl font-semibold text-black">
						{formatCurrency(totalBalance)}
					</span>
					<span className="text-xs text-muted-foreground">Balance</span>
				</div>
			</div>
			<div className="my-4 flex flex-row space-x-4">
				<Button onClick={() => setIsAddingTransaction(true)}>
					<Plus />
					Add Transaction
				</Button>
				<Button variant="secondary" onClick={() => setIsAddingFromFile(true)}>
					<FilePlusCorner />
					Add from file
				</Button>
			</div>
			<AddTransactionsFromFileModal
				open={isAddingFromFile}
				onOpenChange={setIsAddingFromFile}
				accountId={accountId}
			/>
			<AccountTransactionTable
				accountId={accountId}
				isAddingTransaction={isAddingTransaction}
				onCancelAdd={() => setIsAddingTransaction(false)}
			/>
		</div>
	);
}
