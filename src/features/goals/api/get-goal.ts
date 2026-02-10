import { queryOptions, useQuery } from "@tanstack/react-query";
import { type Goal, GoalSchema } from "@/features/goals/config/schemas";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export const getGoal = async (id: string): Promise<Goal> => {
	const response = await api.get<Goal>(`/goals/${id}`);
	return GoalSchema.parse(response);
};

export const getGoalQueryOptions = (id: string) => {
	return queryOptions({
		queryKey: ["goal", id],
		queryFn: () => getGoal(id),
	});
};

type UseGoalOptions = {
	id: string;
	queryConfig?: QueryConfig<typeof getGoalQueryOptions>;
};

export const useGoal = ({ id, queryConfig }: UseGoalOptions) => {
	return useQuery({
		...getGoalQueryOptions(id),
		...queryConfig,
	});
};
