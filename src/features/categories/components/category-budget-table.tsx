import { useCategories } from "@/features/categories/api/get-categories";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/features/categories/config/schemas";
import { DataTable } from "@/components/ui/data-table";
import { EditableAllocatedCell } from "./editable-allocated-cell";

const columns: ColumnDef<Category>[] = [
	{
		id: "category",
		header: "Category",
		cell: ({ row }) => <span>{row.original.name}</span>,
		meta: {
			fluid: true,
		},
	},
	{
		id: "allocation",
		header: () => <div className="text-right">Allocated</div>,
		size: 120,
		accessorFn: (row) => (row.allocations?.at(0)?.amount ?? 0) / 100,
		cell: EditableAllocatedCell,
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
];

export const CategoryBudgetTable = () => {
	const categoriesQuery = useCategories({
		queryParams: {
			expand: "stats,allocations,goal",
		},
	});

	const categories = categoriesQuery?.data;

	console.log({ categories });

	if (!categories) return;

	return (
		<div>
			<DataTable columns={columns} data={categories} disableHover />
		</div>
	);
};
