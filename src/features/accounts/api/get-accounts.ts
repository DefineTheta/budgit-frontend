import { api } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const AccountSchema = z.object({
	id: z.string(),
	name: z.string(),
	user_id: z.string(),
	account_type: z.enum(["CASH", "CREDIT"]),
});

export type Account = z.infer<typeof AccountSchema>;

export const getAccounts = async (): Promise<Account[]> => {
	const response = await api.get("/accounts");
	return z.array(AccountSchema).parse(response.data);
};

export const getAccountsQueryOptions = () => {
	return queryOptions({
		queryKey: ["accounts"],
		queryFn: () => getAccounts,
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
