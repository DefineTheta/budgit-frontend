import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { AccountSchema, type Account } from "@/features/accounts/config/schemas";

export const getAccounts = async (): Promise<Account[]> => {
	const response = await api.get<Account[]>("/accounts");
	return z.array(AccountSchema).parse(response);
};

export const getAccountsQueryOptions = () => {
	return queryOptions({
		queryKey: ["accounts"],
		queryFn: getAccounts,
	});
};

type UseAccountsOptions = {
	queryConfig?: QueryConfig<typeof getAccountsQueryOptions>;
};

export const useAccounts = ({ queryConfig }: UseAccountsOptions = {}) => {
	return useQuery({
		...getAccountsQueryOptions(),
		...queryConfig,
	});
};
