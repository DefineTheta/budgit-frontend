import { CategoryBudgetTable } from "@/features/categories/components/category-budget-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/budget")({
	component: RouteComponent,
});

function RouteComponent() {
	return <CategoryBudgetTable />;
}
