import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCategoryTransferInput } from "@/features/categories/config/schemas";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { categoriesListsQueryKey } from "./get-categories";

export const createCategoryTransfer = ({
	data,
}: {
	data: CreateCategoryTransferInput;
}): Promise<void> => {
	return api.post("/category-transfers", data);
};

type UseCreateCategoryTransferOptions = {
	mutationConfig?: MutationConfig<typeof createCategoryTransfer>;
};

export const useCreateCategoryTransfer = ({
	mutationConfig,
}: UseCreateCategoryTransferOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createCategoryTransfer,
	});
};
