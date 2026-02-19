import type { ColumnDef } from "@tanstack/react-table";
import { getMonth, getYear } from "date-fns";
import { Goal } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCategories } from "@/features/categories/api/get-categories";
import type { Category } from "@/features/categories/config/schemas";
import { calculateMonthlyGoalProgress } from "@/features/categories/helper/goal";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { CategoryActivityHoverCard } from "./category-activity-hover-card";
import { CategoryTransferPopover } from "./category-transfer-popover";
import { EditableAllocatedCell } from "./editable-allocated-cell";

interface CategoryBudgetTableProps {
	startDate: string;
	endDate: string;
	handleGoalClick: (category: Category) => void;
}

export const CategoryBudgetTable = ({
	startDate,
	endDate,
	handleGoalClick,
}: CategoryBudgetTableProps) => {
	const categoriesQuery = useCategories({
		queryParams: {
			expand: "stats,allocations,goal",
			start: startDate,
			end: endDate,
		},
		queryConfig: {
			placeholderData: (previousData) => previousData,
		},
	});

	const categories = categoriesQuery.data ?? [];

	const columns = React.useMemo<ColumnDef<Category>[]>(() => {
		return [
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
					const amount = (row.original.stats?.activity ?? 0) / 100;

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
			{
				id: "available",
				size: 96,
				header: () => <div className="text-right">Available</div>,
				accessorFn: (row) => row.stats?.available ?? 0,
				cell: ({ row, getValue }) => {
					const available = getValue<number>();
					const goal = row.original.goal?.amount;
					const allocated = row.original.allocations?.at(0)?.amount;

					let color = "bg-green-500 text-black";

					if (available < 0) {
						color = "bg-red-500";
					} else if (goal && (!allocated || allocated < goal)) {
						color = "bg-amber-500 text-black";
					} else if (available === 0) {
						color = "bg-gray-500";
					}

					return (
						<div className="flex justify-end">
							<CategoryTransferPopover
								sourceCategoryId={row.original.id}
								availableAmount={available}
								startDate={startDate}
							>
								<button type="button" className="cursor-pointer">
									<Badge className={cn("px-4 h-[26px] text-sm rounded-full", color)}>
										{formatCurrency(available)}
									</Badge>
								</button>
							</CategoryTransferPopover>
						</div>
					);
				},
			},
		];
	}, [startDate]);

	return (
		<DataTable
			columns={columns}
			data={categories}
			onEdit={handleGoalClick}
			disableHover
		/>
	);
};
