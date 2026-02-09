import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesListsQueryKey } from "@/features/categories/api/get-categories";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { CreateGoalInput } from "../config/schemas";

export const createGoal = ({
	categoryId,
	data,
}: {
	categoryId: string;
	data: CreateGoalInput;
}): Promise<void> => {
	return api.post(`/categories/${categoryId}/goals`, data);
};

type UseCreateGoalOptions = {
	mutationConfig?: MutationConfig<typeof createGoal>;
};

export const useCreateGoal = ({ mutationConfig }: UseCreateGoalOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createGoal,
	});
};
