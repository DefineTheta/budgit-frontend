import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { type Payee, PayeeSchema } from "@/features/payees/config/schemas";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export const getPayees = async (): Promise<Payee[]> => {
	const response = await api.get<Payee[]>("/payees");
	return z.array(PayeeSchema).parse(response);
};

export const getPayeesQueryOptions = () => {
	return queryOptions({
		queryKey: ["payees"],
		queryFn: getPayees,
	});
};

type UsePayeesOptions = {
	queryConfig?: QueryConfig<typeof getPayeesQueryOptions>;
};

export const usePayees = ({ queryConfig }: UsePayeesOptions = {}) => {
	return useQuery({
		...getPayeesQueryOptions(),
		...queryConfig,
	});
};

export const useGetPayees = ({ queryConfig }: UsePayeesOptions = {}) => {
	return usePayees({ queryConfig });
};
