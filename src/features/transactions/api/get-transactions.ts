import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

import {
	type Transaction,
	TransactionSchema,
} from "@/features/transactions/config/schemas";

export const getTransactions = async (accountId: string): Promise<Transaction[]> => {
	const response = await api.get<Transaction[]>(`/accounts/${accountId}/transactions`);
	return z.array(TransactionSchema).parse(response);
};

export const getTransactionsQueryOptions = (accountId: string) => {
	return queryOptions({
		queryKey: ["transactions", accountId],
		queryFn: () => getTransactions(accountId),
	});
};

type UseTransactionsOptions = {
	accountId: string;
	queryConfig?: QueryConfig<typeof getTransactionsQueryOptions>;
};

export const useTransactions = ({ accountId, queryConfig }: UseTransactionsOptions) => {
	return useQuery({
		...getTransactionsQueryOptions(accountId),
		...queryConfig,
	});
};
