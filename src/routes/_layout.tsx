import { MainLayout } from "@/components/layout/main-layout";
import { getAccountsQueryOptions } from "@/features/accounts";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
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
