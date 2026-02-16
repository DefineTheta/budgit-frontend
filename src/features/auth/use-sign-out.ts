import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export const useSignOut = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: async () => {
			await authClient.signOut();
		},
		onSuccess: async () => {
			queryClient.clear();
			await router.navigate({ to: "/login" });
		},
		onError: (err) => {
			console.error(err);
		},
	});
};
