import { authClient } from "@/lib/auth-client";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const authKeys = {
	session: ["auth", "session"] as const,
};

export const authQueryOptions = queryOptions({
	queryKey: authKeys.session,
	queryFn: async () => {
		const { data } = await authClient.getSession();
		return data;
	},
	staleTime: 60 * 5 * 10000,
	retry: false,
	refetchOnWindowFocus: true,
});

export function useSession() {
	return useQuery(authQueryOptions);
}
