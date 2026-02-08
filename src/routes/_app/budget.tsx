import { MonthPicker } from "@/components/month-picker";
import { CategoryBudgetTable } from "@/features/categories/components/category-budget-table";
import { createFileRoute } from "@tanstack/react-router";
import { endOfMonth, startOfMonth } from "date-fns";
import React from "react";

export const Route = createFileRoute("/_app/budget")({
	component: RouteComponent,
});

function RouteComponent() {
	const [month, setMonth] = React.useState(new Date());

	const startDate = React.useMemo(() => startOfMonth(month), [month]);
	const endDate = React.useMemo(() => endOfMonth(month), [month]);

	return (
		<div className="flex flex-col">
			<MonthPicker className="mb-6" value={month} setValue={setMonth} />
			<CategoryBudgetTable startDate={startDate} endDate={endDate} />
		</div>
	);
}
