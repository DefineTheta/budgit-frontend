import { useAccounts } from "@/features/accounts";

export const Sidebar = () => {
	const accountsQuery = useAccounts();

	if (!accountsQuery.isLoading && !accountsQuery.isError) console.log(accountsQuery.data);

	return <div></div>;
};
