import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/main-layout";
import { getAccountsQueryOptions } from "@/features/accounts";

export const Route = createFileRoute("/_app")({
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
