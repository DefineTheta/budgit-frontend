import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	Allocation,
	UpdateAllocationInput,
} from "@/features/allocations/config/schemas";
import { categoriesListsQueryKey } from "@/features/categories/api/get-categories";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

export const updateAllocation = ({
	allocationId,
	data,
}: {
	allocationId: string;
	data: UpdateAllocationInput;
}): Promise<Allocation> => {
	return api.put(`/allocations/${allocationId}`, data);
};

type UseUpdateAllocationOptions = {
	mutationConfig?: MutationConfig<typeof updateAllocation>;
};

export const useUpdateAllocation = ({
	mutationConfig,
}: UseUpdateAllocationOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: updateAllocation,
	});
};
