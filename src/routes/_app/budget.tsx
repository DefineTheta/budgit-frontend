import { MonthPicker } from "@/components/month-picker";
import { CategoryBudgetTable } from "@/features/categories/components/category-budget-table";
import type { Category } from "@/features/categories/config/schemas";
import { GoalModal } from "@/features/goals/components/goal-modal";
import { createFileRoute } from "@tanstack/react-router";
import { endOfMonth, startOfMonth } from "date-fns";
import React from "react";

export const Route = createFileRoute("/_app/budget")({
	component: RouteComponent,
});

function RouteComponent() {
	const [month, setMonth] = React.useState(new Date());
	const [editingGoalId, setEditingGoalId] = React.useState<number>();
	const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
	const [selectedCategory, setSelectedCategory] = React.useState<Category>();

	const startDate = React.useMemo(() => startOfMonth(month), [month]);
	const endDate = React.useMemo(() => endOfMonth(month), [month]);

	const handleGoalClick = (category: Category) => {
		setSelectedCategory(category);
		setEditingGoalId(category.goal?.id);
		setIsGoalModalOpen(true);
	};

	const handleGoalModalClose = (open: boolean) => {
		setIsGoalModalOpen(open);
		setSelectedCategory(undefined);

		if (!open) setTimeout(() => setEditingGoalId(undefined), 300);
	};

	return (
		<div className="flex flex-col">
			<MonthPicker className="mb-6" value={month} setValue={setMonth} />
			<CategoryBudgetTable
				startDate={startDate}
				endDate={endDate}
				handleGoalClick={handleGoalClick}
			/>
			<GoalModal
				open={isGoalModalOpen}
				edit={false}
				goalId={null}
				categoryName={selectedCategory?.name ?? ""}
				categoryId={selectedCategory?.id ?? ""}
				onOpenChange={handleGoalModalClose}
				onSave={() => null}
			/>
		</div>
	);
}
