import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-slate-100">
			<div className="pointer-events-none absolute -top-28 -left-20 h-72 w-72 rounded-full bg-violet-200/45 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
			<div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />

			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
				<div className="w-full max-w-md">
					<div className="w-full">
						<Outlet />
					</div>
				</div>
			</div>
		</main>
	);
}
