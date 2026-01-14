import { useAccounts } from "@/features/accounts";

export const Sidebar = () => {
	const { data: accounts, isLoading, isError } = useAccounts();

	return <div></div>;
};
