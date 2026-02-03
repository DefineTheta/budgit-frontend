import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { type Category, CategorySchema } from "@/features/categories/config/schemas";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export const getCategories = async (): Promise<Category[]> => {
	const response = await api.get<Category[]>("/categories");
	return z.array(CategorySchema).parse(response);
};

export const getCategoriesQueryOptions = () => {
	return queryOptions({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
};

type UseCategoriesOptions = {
	queryConfig?: QueryConfig<typeof getCategoriesQueryOptions>;
};

export const useCategories = ({ queryConfig }: UseCategoriesOptions = {}) => {
	return useQuery({
		...getCategoriesQueryOptions(),
		...queryConfig,
	});
};
