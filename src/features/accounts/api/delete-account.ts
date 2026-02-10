import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getAccountQueryOptions } from "./get-account";
import { getAccountsQueryOptions } from "./get-accounts";

export const deleteAccount = ({ accountId }: { accountId: string }): Promise<void> => {
	return api.delete(`/accounts/${accountId}`);
};

type UseDeleteAccountOptions = {
	mutationConfig?: MutationConfig<typeof deleteAccount>;
};

export const useDeleteAccount = ({ mutationConfig }: UseDeleteAccountOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			const accountId = args[1].accountId;
			queryClient.invalidateQueries({ queryKey: getAccountsQueryOptions().queryKey });
			queryClient.invalidateQueries({
				queryKey: getAccountQueryOptions(accountId).queryKey,
			});
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: deleteAccount,
	});
};
