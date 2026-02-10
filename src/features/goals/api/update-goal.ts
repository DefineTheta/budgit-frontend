import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import type { Goal, UpdateGoalSchema } from "@/features/goals/config/schemas";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getGoalQueryOptions } from "./get-goal";
import { categoriesListsQueryKey } from "@/features/categories/api/get-categories";

export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;

export const updateGoal = ({
	goalId,
	data,
}: {
	goalId: string;
	data: UpdateGoalInput;
}): Promise<Goal> => {
	return api.put(`/goals/${goalId}`, data);
};

type UseUpdateGoalOptions = {
	mutationConfig?: MutationConfig<typeof updateGoal>;
};

export const useUpdateGoal = ({ mutationConfig }: UseUpdateGoalOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (goal, ...args) => {
			queryClient.invalidateQueries({ queryKey: getGoalQueryOptions(goal.id).queryKey });
			queryClient.invalidateQueries({ queryKey: categoriesListsQueryKey });
			onSuccess?.(goal, ...args);
		},
		...restConfig,
		mutationFn: updateGoal,
	});
};
