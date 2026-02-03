import {
	type DefaultOptions,
	QueryClient,
	type UseMutationOptions,
} from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
	queries: {
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: 1000 * 60,
	},
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> = Awaited<
	ReturnType<FnType>
>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
	ReturnType<T>,
	"queryKey" | "queryFn"
>;

export type MutationConfig<MutationFnType extends (...args: any) => Promise<any>> =
	UseMutationOptions<
		ApiFnReturnType<MutationFnType>,
		Error,
		Parameters<MutationFnType>[0]
	>;
