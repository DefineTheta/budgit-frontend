import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/features/accounts/api/get-account";
import { AccountTransactionTable } from "@/features/transactions/components/account-transaction-table";

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId } = Route.useParams();
	const [isAddingTransaction, setIsAddingTransaction] = useState(false);

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
			<div className="my-8">
				<Button onClick={() => setIsAddingTransaction(true)}>
					<PlusIcon />
					Add Transaction
				</Button>
			</div>
			<AccountTransactionTable
				accountId={accountId}
				isAddingTransaction={isAddingTransaction}
				onCancelAdd={() => setIsAddingTransaction(false)}
			/>
		</div>
	);
}
