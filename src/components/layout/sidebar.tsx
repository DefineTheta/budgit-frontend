import { Link } from "@tanstack/react-router";
import { useAccounts } from "@/features/accounts";
import { ACCOUNT_TYPE, ACCOUNT_TYPE_LABLES } from "@/features/accounts/config/constants";
import { Coins, NotebookText } from "lucide-react";

export const Sidebar = () => {
	const accountsQuery = useAccounts();

	const accounts = accountsQuery.data ?? [];

	const groupedAccouts = {
		[ACCOUNT_TYPE_LABLES[ACCOUNT_TYPE.CASH]]: accounts.filter(
			(account) => account.account_type === ACCOUNT_TYPE.CASH,
		),
		[ACCOUNT_TYPE_LABLES[ACCOUNT_TYPE.DEBIT]]: accounts.filter(
			(account) => account.account_type === ACCOUNT_TYPE.DEBIT,
		),
		[ACCOUNT_TYPE_LABLES[ACCOUNT_TYPE.CREDIT]]: accounts.filter(
			(account) => account.account_type === ACCOUNT_TYPE.CREDIT,
		),
	};

	return (
		<div className="w-64 py-3 px-2 flex flex-col space-y-4 bg-primary-foreground">
			<Link to="/budget">
				<div class="my-2 px-2 py-2 rounded-md cursor-pointer hover:bg-secondary flex items-center">
					<Coins className="mr-2" />
					<span>Budget</span>
				</div>
			</Link>
			{Object.entries(groupedAccouts)
				.filter(([_, accounts]) => accounts.length)
				.map(([name, accounts]) => (
					<div>
						<h3 className="mb-1 font-semibold uppercase">{name}</h3>{" "}
						{accounts.map((account) => (
							<Link
								key={account.id}
								to="/accounts/$accountId"
								params={{ accountId: account.id }}
							>
								<div className="px-2 py-1 flex rounded-md cursor-pointer hover:bg-secondary">
									<span>{account.name}</span>
								</div>
							</Link>
						))}
					</div>
				))}
		</div>
	);
};
