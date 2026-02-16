import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
	type Transaction,
	TransactionSchema,
} from "@/features/transactions/config/schemas";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export const getCategoryTransactions = async (
	categoryId: string,
): Promise<Transaction[]> => {
	const response = await api.get<Transaction[]>(`/categories/${categoryId}/transactions`);
	return z.array(TransactionSchema).parse(response);
};

export const getCategoryTransactionsQueryOptions = (categoryId: string) => {
	return queryOptions({
		queryKey: ["categories", categoryId, "transactions"],
		queryFn: () => getCategoryTransactions(categoryId),
	});
};

type UseCategoryTransactionsOptions = {
	categoryId: string;
	queryConfig?: QueryConfig<typeof getCategoryTransactionsQueryOptions>;
};

export const useCategoryTransactions = ({
	categoryId,
	queryConfig,
}: UseCategoryTransactionsOptions) => {
	return useQuery({
		...getCategoryTransactionsQueryOptions(categoryId),
		...queryConfig,
	});
};
