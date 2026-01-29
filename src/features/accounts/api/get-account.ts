import { AccountSchema, type Account } from "@/features/accounts/config/schemas";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getAccount = async (id: string): Promise<Account> => {
	const response = await api.get<Account[]>(`/accounts/${id}`);
	return AccountSchema.parse(response);
};

export const getAccountQueryOptions = (id: string) => {
	return queryOptions({
		queryKey: ["account", id],
		queryFn: () => getAccount(id),
	});
};

type UseAccountOptions = {
	id: string;
	queryConfig?: QueryConfig<typeof getAccountQueryOptions>;
};

export const useAccount = ({ id, queryConfig }: UseAccountOptions) => {
	return useQuery({
		...getAccountQueryOptions(id),
		...queryConfig,
	});
};
