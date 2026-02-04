import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category, CreateCategoryInput } from "@/features/categories/config/schemas";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getCategoriesQueryOptions } from "./get-categories";

export const createCategory = ({
	data,
}: {
	data: CreateCategoryInput;
}): Promise<Category> => {
	return api.post("/categories", data);
};

type UseCreateCategoryOptions = {
	mutationConfig?: MutationConfig<typeof createCategory>;
};

export const useCreateCategory = ({ mutationConfig }: UseCreateCategoryOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: getCategoriesQueryOptions().queryKey });
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: createCategory,
	});
};
