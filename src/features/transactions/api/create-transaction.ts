import { api } from "@/lib/api-client";
import type { CreateTransactionInput, Transaction } from "../config/schemas";
import type { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactionsQueryOptions } from "./get-transactions";

export const createTransaction = ({
	data,
}: {
	data: CreateTransactionInput;
}): Promise<Transaction> => {
	return api.post("/transactions", data);
};

type UseCreateTransactionOptions = {
	mutationConfig?: MutationConfig<typeof createTransaction>;
};

export const useCreateTransaction = ({
	mutationConfig,
}: UseCreateTransactionOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getTransactionsQueryOptions(args[0].account_id).queryKey,
			});
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createTransaction,
	});
};
