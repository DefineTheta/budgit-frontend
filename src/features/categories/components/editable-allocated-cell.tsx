import type { Column, Row, Table } from "@tanstack/react-table";
import { format, startOfMonth } from "date-fns";
import { History } from "lucide-react";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateAllocation } from "@/features/allocations/api/create-allocation";
import { useUpdateAllocation } from "@/features/allocations/api/update-allocation";
import { useMathInput } from "@/hooks/use-math-input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import type { Category } from "../config/schemas";

interface EditableAllocatedCellProps<TData> {
	getValue: () => any;
	row: Row<TData>;
	column: Column<TData>;
	table: Table<TData>;
	month: string;
}

export const EditableAllocatedCell = ({
	getValue,
	row,
	month,
}: EditableAllocatedCellProps<Category>) => {
	const initialValue = getValue();
	const [isEditing, setIsEditing] = React.useState(false);
	const { displayValue, changeValue, handleChange, calculate } =
		useMathInput(initialValue);

	const inputRef = React.useRef<HTMLInputElement>(null);

	const { mutate: createAllocationMutation } = useCreateAllocation();
	const { mutate: updateAllocationMutation } = useUpdateAllocation();

	const allocation = row.original.allocations?.at(0);
	const movedAmount = row.original.stats?.moved ?? 0;

	const onBlur = () => {
		setIsEditing(false);
		const numericValue = calculate();

		if (numericValue === undefined) return;

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
			setIsEditing(false);
		}
	};

	useEffect(() => changeValue(initialValue), [initialValue]);

	if (isEditing) {
		return (
			<Input
				ref={inputRef}
				inputMode="decimal"
				value={displayValue}
				onChange={(e) => handleChange(e.target.value)}
				onFocus={(e) => e.currentTarget.select()}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				autoFocus
				className="h-8 w-full text-right pr-2"
			/>
		);
	}

	return (
		<button
			type="button"
			onClick={() => {
				setIsEditing(true);
			}}
			className={cn(
				"cursor-pointer hover:bg-muted/50 p-2 rounded-md text-right h-8 w-full flex items-center justify-end gap-1.5",
				"border border-transparent hover:border-border",
			)}
		>
			{movedAmount !== 0 ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="inline-flex text-muted-foreground">
							<History className="w-3.5 h-3.5" />
						</span>
					</TooltipTrigger>
					<TooltipContent>Moved {formatCurrency(movedAmount)}</TooltipContent>
				</Tooltip>
			) : null}
			{displayValue}
		</button>
	);
};
