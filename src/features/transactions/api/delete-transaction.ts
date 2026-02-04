import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "../config/schemas";
import { getTransactionsQueryOptions } from "./get-transactions";

export const deleteTransaction = ({ data }: { data: Transaction }): Promise<void> => {
	return api.delete(`/transactions/${data.id}`);
};

type UseDeleteTransactionOptions = {
	mutationConfig?: MutationConfig<typeof deleteTransaction>;
};

export const useDeleteTransactions = ({
	mutationConfig,
}: UseDeleteTransactionOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getTransactionsQueryOptions(args[1].data.account_id).queryKey,
			});
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: deleteTransaction,
	});
};
