import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ACCOUNT_TYPE } from "../config/constants";

export const AccountSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	account_type: z.union([
		z.literal(ACCOUNT_TYPE.CASH),
		z.literal(ACCOUNT_TYPE.DEBIT),
		z.literal(ACCOUNT_TYPE.CREDIT),
	]),
});

export type Account = z.infer<typeof AccountSchema>;

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
