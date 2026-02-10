import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Account, CreateAccountInput } from "@/features/accounts/config/schemas";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getAccountsQueryOptions } from "./get-accounts";

export const createAccount = ({
	data,
}: {
	data: CreateAccountInput;
}): Promise<Account> => {
	return api.post("/accounts", data);
};

type UseCreateAccountOptions = {
	mutationConfig?: MutationConfig<typeof createAccount>;
};

export const useCreateAccount = ({ mutationConfig }: UseCreateAccountOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: getAccountsQueryOptions().queryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createAccount,
	});
};
