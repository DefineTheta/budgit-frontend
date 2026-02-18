import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Column, Row, Table } from "@tanstack/react-table";
import React from "react";
import type { Category } from "../config/schemas";
import { useCreateAllocation } from "@/features/allocations/api/create-allocation";
import { format, startOfMonth } from "date-fns";
import { useUpdateAllocation } from "@/features/allocations/api/update-allocation";

interface EditableAllocatedCellProps<TData> {
	getValue: () => any;
	row: Row<TData>;
	column: Column<TData>;
	table: Table<TData>;
	month: string;
}

export const EditableAllocatedCell = <TData,>({
	getValue,
	row,
	column,
	table,
	month,
}: EditableAllocatedCellProps<Category>) => {
	const initialValue = getValue();
	const [value, setValue] = React.useState(initialValue);
	const [isEditing, setIsEditing] = React.useState(false);

	const inputRef = React.useRef<HTMLInputElement>(null);

	const { mutate: createAllocationMutation, isPending: isCreatingAllocation } =
		useCreateAllocation();
	const { mutate: updateAllocationMutation, isPending: isUpdatingAllocation } =
		useUpdateAllocation();

	const allocation = row.original.allocations?.at(0);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-AU", {
			style: "currency",
			currency: "AUD",
		}).format(amount);
	};

	const onBlur = () => {
		setIsEditing(false);
		const numericValue = parseFloat(value);

		if (numericValue !== initialValue) {
			if (allocation) {
				updateAllocationMutation({
					allocationId: allocation.id,
					data: {
						amount: numericValue * 100,
					},
				});
			} else {
				createAllocationMutation({
					categoryId: row.original.id,
					data: {
						month: format(startOfMonth(month), "yyyy-MM-dd"),
						amount: numericValue * 100,
					},
				});
			}
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
		} else if (e.key === "Escape") {
			e.preventDefault();
			setValue(initialValue);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<Input
				ref={inputRef}
				value={value}
				onChange={(e) => {
					const val = e.target.value;
					if (/^\d*\.?\d*$/.test(val)) {
						setValue(val);
					}
				}}
				onFocus={(e) => e.currentTarget.select()}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				autoFocus
				className="h-8 w-full text-right pr-2"
			/>
		);
	}

	return (
		<div
			onClick={() => {
				setValue(Number(initialValue).toFixed(2));
				setIsEditing(true);
			}}
			className={cn(
				"cursor-pointer hover:bg-muted/50 p-2 rounded-md text-right h-8 flex items-center justify-end",
				"border border-transparent hover:border-border",
			)}
		>
			{formatCurrency(Number(value))}
		</div>
	);
};
