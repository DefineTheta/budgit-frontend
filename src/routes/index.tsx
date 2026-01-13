import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-2">
			<h3 className="text-xl font-bold mb-4">Welcome Home!</h3>
			<Button>Shadcn Button on Home</Button>
		</div>
	);
}
