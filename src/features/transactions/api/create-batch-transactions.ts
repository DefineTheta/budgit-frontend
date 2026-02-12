import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesListsQueryKey } from "@/features/categories/api/get-categories";
import { getTransactionsQueryOptions } from "@/features/transactions/api/get-transactions";
import type {
	CreateTransactionInput,
	Transaction,
} from "@/features/transactions/config/schemas";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

export const createBatchTransactions = ({
	data,
}: {
	data: CreateTransactionInput[];
}): Promise<Transaction[]> => {
	return api.post("/transactions/batch", data);
};

type UseCreateBatchTransactionsOptions = {
	mutationConfig?: MutationConfig<typeof createBatchTransactions>;
};

export const useCreateBatchTransactions = ({
	mutationConfig,
}: UseCreateBatchTransactionsOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			const accountId = args[1].data[0]?.account_id;
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			if (accountId) {
				queryClient.invalidateQueries({
					queryKey: getTransactionsQueryOptions(accountId).queryKey,
				});
			}
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createBatchTransactions,
	});
};
