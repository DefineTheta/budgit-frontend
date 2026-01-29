import { useAccount } from "@/features/accounts/api/get-account";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId } = Route.useParams();

	const accountQuery = useAccount({
		id: accountId,
	});

	const account = accountQuery.data;

	if (!account) return;

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-4">{account.name}</h2>
		</div>
	);
}
