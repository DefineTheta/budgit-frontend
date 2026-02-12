import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesListsQueryKey } from "@/features/categories/api/get-categories";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { Transaction, UpdateTransactionInput } from "../config/schemas";
import { getTransactionsQueryOptions } from "./get-transactions";

type UpdateTransactionPayload = {
	transactionId: string;
	accountId: string;
	data: UpdateTransactionInput;
};

export const updateTransaction = ({
	transactionId,
	data,
}: UpdateTransactionPayload): Promise<Transaction> => {
	return api.put(`/transactions/${transactionId}`, data);
};

type UseUpdateTransactionOptions = {
	mutationConfig?: MutationConfig<typeof updateTransaction>;
};

export const useUpdateTransaction = ({
	mutationConfig,
}: UseUpdateTransactionOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (transaction, ...args) => {
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			queryClient.invalidateQueries({
				queryKey: getTransactionsQueryOptions(args[0].accountId).queryKey,
			});
			onSuccess?.(transaction, ...args);
		},
		...restConfig,
		mutationFn: updateTransaction,
	});
};
