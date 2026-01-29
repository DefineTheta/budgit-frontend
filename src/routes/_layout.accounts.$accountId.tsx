import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/accounts/$accountId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId } = Route.useParams();
	return <div>Account Page: {accountId}</div>;
}
