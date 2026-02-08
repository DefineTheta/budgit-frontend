import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	Allocation,
	CreateAllocationInput,
} from "@/features/allocations/config/schemas";
import { categoriesListsQueryKey } from "@/features/categories/api/get-categories";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

export const createAllocation = ({
	categoryId,
	data,
}: {
	categoryId: string;
	data: CreateAllocationInput;
}): Promise<Allocation> => {
	return api.post(`/categories/${categoryId}/allocations`, data);
};

type UseCreateAllocationOptions = {
	mutationConfig?: MutationConfig<typeof createAllocation>;
};

export const useCreateAllocation = ({
	mutationConfig,
}: UseCreateAllocationOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createAllocation,
	});
};
