import { api } from "@/lib/api-client";
import type { CreatePayeeInput, Payee } from "@/features/payees/config/schemas";
import type { MutationConfig } from "@/lib/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayeesQueryOptions } from "./get-payees";

export const createPayee = ({ data }: { data: CreatePayeeInput }): Promise<Payee> => {
	return api.post("/payees", data);
};

type UseCreatePayeeOptions = {
	mutationConfig?: MutationConfig<typeof createPayee>;
};

export const useCreatePayee = ({ mutationConfig }: UseCreatePayeeOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: getPayeesQueryOptions().queryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createPayee,
	});
};
