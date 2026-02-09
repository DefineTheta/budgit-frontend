import { useCategories } from "@/features/categories/api/get-categories";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/features/categories/config/schemas";
import { DataTable } from "@/components/ui/data-table";
import { EditableAllocatedCell } from "./editable-allocated-cell";
import React from "react";
import { Goal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { endOfMonth, format, set } from "date-fns";

interface CategoryBudgetTableProps {
	startDate?: Date;
	endDate?: Date;
	handleGoalClick: (category: Category) => void;
}

const currency = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

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
					const goalAmount = row.original.goal?.amount;
					const allocatedAmount = row.original.allocations?.at(0)?.amount;
					const remainingAmount = ((goalAmount ?? 0) - (allocatedAmount ?? 0)) / 100;
					const monthDay = row.original.goal?.repeat_day_month;
					const goalDate =
						monthDay && monthDay !== 32
							? set(endOfMonth(new Date()), {
									date: monthDay,
								})
							: endOfMonth(new Date());

					let color = undefined;
					let progress = 0;

					if (allocatedAmount && goalAmount) {
						if (allocatedAmount < goalAmount) {
							color = "text-yellow-500";
						} else if (allocatedAmount >= goalAmount) {
							color = "text-green-500";
						}

						progress = (allocatedAmount / goalAmount) * 100;
					}

					return (
						<div className="my-1 flex flex-col">
							<div className="flex justify-between items-center">
								<span className="mb-1">{row.original.name}</span>
								{goalAmount && (
									<span className="text-muted-foreground">{`${currency.format(remainingAmount)} needed by ${format(goalDate, "do")}`}</span>
								)}
							</div>
							<Progress className={color} value={progress} />
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
					const formattedAmount = new Intl.NumberFormat("en-AU", {
						style: "currency",
						currency: "AUD",
					}).format(amount);

					return <div className="text-right">{formattedAmount}</div>;
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
		<>
			<DataTable
				columns={columns}
				data={categories}
				onEdit={handleGoalClick}
				disableHover
			/>
		</>
	);
};
