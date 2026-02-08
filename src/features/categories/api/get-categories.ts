import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { type Category, CategorySchema } from "@/features/categories/config/schemas";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export const categoriesListsQueryKey = ["categories", "list"] as const;
export type GetCategoriesQueryParams = {
	expand?: string;
	start?: Date;
	end?: Date;
};

export const getCategories = async (
	queryParams?: GetCategoriesQueryParams,
): Promise<Category[]> => {
	const response = await api.get<Category[]>("/categories", {
		params: queryParams,
	});
	return z.array(CategorySchema).parse(response);
};

export const getCategoriesQueryOptions = (queryParams?: GetCategoriesQueryParams) => {
	return queryOptions({
		queryKey: [...categoriesListsQueryKey, queryParams],
		queryFn: () => getCategories(queryParams),
	});
};

type UseCategoriesOptions = {
	queryParams?: GetCategoriesQueryParams;
	queryConfig?: QueryConfig<typeof getCategoriesQueryOptions>;
};

export const useCategories = ({
	queryParams,
	queryConfig,
}: UseCategoriesOptions = {}) => {
	return useQuery({
		...getCategoriesQueryOptions(queryParams),
		...queryConfig,
	});
};
