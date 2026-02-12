import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, FilePlusCorner, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/features/accounts/api/get-account";
import { AccountTransactionTable } from "@/features/transactions/components/account-transaction-table";
import { AddTransactionsFromFileModal } from "@/features/transactions/components/add-transactions-from-file-modal";

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

	const account = accountQuery.data;

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
			<div className="my-8 flex flex-row space-x-4">
				<Button onClick={() => setIsAddingTransaction(true)}>
					<PlusIcon />
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
