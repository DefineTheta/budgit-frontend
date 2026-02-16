import type { ColumnDef } from "@tanstack/react-table";
import { getMonth, getYear } from "date-fns";
import { Goal } from "lucide-react";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCategories } from "@/features/categories/api/get-categories";
import type { Category } from "@/features/categories/config/schemas";
import { calculateMonthlyGoalProgress } from "@/features/categories/helper/goal";
import { CategoryActivityHoverCard } from "./category-activity-hover-card";
import { EditableAllocatedCell } from "./editable-allocated-cell";

interface CategoryBudgetTableProps {
	startDate: Date;
	endDate: Date;
	handleGoalClick: (category: Category) => void;
}

export const CategoryBudgetTable = ({
	startDate,
	endDate,
	handleGoalClick,
}: CategoryBudgetTableProps) => {
	const columns = React.useMemo<ColumnDef<Category>[]>(
		() => [
			{
				id: "category",
				header: "Category",
				cell: ({ row }) => {
					const goalProgress = calculateMonthlyGoalProgress(
						getYear(startDate),
						getMonth(startDate),
						Math.abs(row.original.stats?.total ?? 0),
						row.original.goal,
						row.original.allocations?.at(0),
					);

					let color: string | undefined;

					if (goalProgress.status === "UNDERFUNDED") {
						color = "text-yellow-500";
					} else if (goalProgress.status === "FUNDED") {
						color = "text-green-500";
					}

					return (
						<div className="my-1 flex flex-col">
							<div className="flex justify-between items-center">
								<span className="mb-1">{row.original.name}</span>
								<span className="text-muted-foreground">{goalProgress.text}</span>
							</div>
							<SegmentedProgress
								value={goalProgress.progress}
								segments={goalProgress.segments}
								className={color}
								gap={4}
							/>
						</div>
					);
				},
				meta: {
					fluid: true,
				},
			},
			{
				id: "allocation",
				header: () => <div className="text-right">Allocated</div>,
				size: 120,
				accessorFn: (row) => (row.allocations?.at(0)?.amount ?? 0) / 100,
				cell: (data) => (
					<EditableAllocatedCell month={startDate ?? new Date()} {...data} />
				),
			},
			{
				id: "activity",
				header: () => <div className="text-right">Activity</div>,
				size: 144,
				cell: ({ row }) => {
					const amount = (row.original.stats?.total ?? 0) / 100;

					return (
						<CategoryActivityHoverCard
							categoryId={row.original.id}
							categoryName={row.original.name}
							activityAmount={amount}
						/>
					);
				},
			},
			{
				id: "actions",
				size: 64,
				cell: ({ row, table }) => (
					<Tooltip>
						<TooltipTrigger className="w-full flex justify-center items-center">
							<Goal
								role="button"
								className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary"
								onClick={() => table.options.meta?.onEdit?.(row.original)}
							/>
						</TooltipTrigger>
						<TooltipContent>Goal</TooltipContent>
					</Tooltip>
				),
			},
		],
		[startDate],
	);

	const categoriesQuery = useCategories({
		queryParams: {
			expand: "stats,allocations,goal",
			start: startDate,
			end: endDate,
		},
	});

	const categories = categoriesQuery?.data;

	if (!categories) return;

	return (
		<DataTable
			columns={columns}
			data={categories}
			onEdit={handleGoalClick}
			disableHover
		/>
	);
};
