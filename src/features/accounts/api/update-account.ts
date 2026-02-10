import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Account, UpdateAccountInput } from "@/features/accounts/config/schemas";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getAccountQueryOptions } from "./get-account";
import { getAccountsQueryOptions } from "./get-accounts";

export const updateAccount = ({
	accountId,
	data,
}: {
	accountId: string;
	data: UpdateAccountInput;
}): Promise<Account> => {
	return api.put(`/accounts/${accountId}`, data);
};

type UseUpdateAccountOptions = {
	mutationConfig?: MutationConfig<typeof updateAccount>;
};

export const useUpdateAccount = ({ mutationConfig }: UseUpdateAccountOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (account, ...args) => {
			queryClient.invalidateQueries({ queryKey: getAccountsQueryOptions().queryKey });
			queryClient.invalidateQueries({
				queryKey: getAccountQueryOptions(account.id).queryKey,
			});
			onSuccess?.(account, ...args);
		},
		...restConfig,
		mutationFn: updateAccount,
	});
};
