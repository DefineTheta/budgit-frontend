import { Link } from "@tanstack/react-router";
import { Coins, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/features/accounts";
import { CreateAccountModal } from "@/features/accounts/components/create-account-modal";
import { EditAccountModal } from "@/features/accounts/components/edit-account-modal";
import { ACCOUNT_TYPE, ACCOUNT_TYPE_LABLES } from "@/features/accounts/config/constants";
import type { Account } from "@/features/accounts/config/schemas";

export const Sidebar = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<Account | null>(null);
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
		<>
			<div className="w-64 py-3 px-2 flex flex-col space-y-4 bg-primary-foreground">
				<Link to="/budget">
					<div className="my-2 px-2 py-2 rounded-md cursor-pointer hover:bg-secondary flex items-center">
						<Coins className="mr-2" />
						<span>Budget</span>
					</div>
				</Link>
				{Object.entries(groupedAccouts)
					.filter(([_, accounts]) => accounts.length)
					.map(([name, accounts]) => (
						<div key={name}>
							<h3 className="mb-1 font-semibold uppercase">{name}</h3>{" "}
							{accounts.map((account) => (
								<div key={account.id} className="group relative">
									<Link
										to="/accounts/$accountId"
										params={{ accountId: account.id }}
										className="block"
									>
										<div className="px-2 py-1 flex items-center rounded-md cursor-pointer hover:bg-secondary">
											<Pencil
												className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setEditingAccount(account);
												}}
											/>
											<span>{account.name}</span>
										</div>
									</Link>
								</div>
							))}
						</div>
					))}
				<Button
					variant="outline"
					className="justify-start"
					onClick={() => setIsCreateModalOpen(true)}
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Account
				</Button>
			</div>
			<CreateAccountModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
			{editingAccount && (
				<EditAccountModal
					open={!!editingAccount}
					onOpenChange={(open) => !open && setEditingAccount(null)}
					account={editingAccount}
				/>
			)}
		</>
	);
};
