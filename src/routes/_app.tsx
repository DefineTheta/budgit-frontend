import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/main-layout";
import { getAccountsQueryOptions } from "@/features/accounts";
import { authQueryOptions } from "@/features/auth/use-session";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context, location }) => {
		const { queryClient } = context;

		try {
			const data = await queryClient.ensureQueryData(authQueryOptions);

			if (!data?.session) {
				throw redirect({
					to: "/login",
					search: {
						redirect: location.href,
					},
				});
			}
		} catch (err) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(getAccountsQueryOptions()),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	);
}
