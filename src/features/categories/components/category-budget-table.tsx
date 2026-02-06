import { useCategories } from "@/features/categories/api/get-categories";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/features/categories/config/schemas";
import { DataTable } from "@/components/ui/data-table";

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
		id: "activity",
		header: "Activity",
		size: 126,
		cell: ({ row }) => {
			const amount = (row.original.stats?.total ?? 0) / 100;
			const formattedAmount = new Intl.NumberFormat("en-AU", {
				style: "currency",
				currency: "AUD",
			}).format(amount);

			return formattedAmount;
		},
	},
];

export const CategoryBudgetTable = () => {
	const categoriesQuery = useCategories({
		queryParams: {
			expand: "stats",
		},
	});

	const categories = categoriesQuery?.data;

	if (!categories) return;

	return (
		<div>
			<DataTable columns={columns} data={categories} />
		</div>
	);
};
