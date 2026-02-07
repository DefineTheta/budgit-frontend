import { MonthPicker } from "@/components/month-picker";
import { CategoryBudgetTable } from "@/features/categories/components/category-budget-table";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_app/budget")({
	component: RouteComponent,
});

function RouteComponent() {
	const [month, setMonth] = React.useState(new Date());

	return (
		<div className="flex flex-col">
			<MonthPicker className="mb-6" value={month} setValue={setMonth} />
			<CategoryBudgetTable />
		</div>
	);
}
