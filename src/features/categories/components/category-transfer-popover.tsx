import { format, startOfMonth } from "date-fns";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateCategoryTransfer } from "@/features/categories/api/create-category-transfer";
import { useCategories } from "@/features/categories/api/get-categories";
import { formatCurrency } from "@/utils/currency";

const toCents = (value: string) => {
	const parsed = Number.parseFloat(value);

	if (Number.isNaN(parsed)) {
		return 0;
	}

	return Math.round(parsed * 100);
};

type CategoryTransferPopoverProps = {
	sourceCategoryId: string;
	availableAmount: number;
	startDate: string;
	children: ReactNode;
};

export const CategoryTransferPopover = ({
	sourceCategoryId,
	availableAmount,
	startDate,
	children,
}: CategoryTransferPopoverProps) => {
	const [open, setOpen] = useState(false);
	const [moveAmount, setMoveAmount] = useState("");
	const [toCategoryId, setToCategoryId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const moveInputRef = useRef<HTMLInputElement>(null);

	const categoriesQuery = useCategories();
	const categories = categoriesQuery.data ?? [];
	const toCategories = categories.filter((category) => category.id !== sourceCategoryId);
	const firstDayOfMonth = format(startOfMonth(new Date(startDate)), "yyyy-MM-dd");

	const resetForm = () => {
		setMoveAmount("");
		setToCategoryId("");
		setError(null);
	};

	const { mutate: createCategoryTransfer, isPending } = useCreateCategoryTransfer({
		mutationConfig: {
			onSuccess: () => {
				setOpen(false);
				resetForm();
			},
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		requestAnimationFrame(() => {
			moveInputRef.current?.focus();
			moveInputRef.current?.select();
		});
	}, [open]);

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);

		if (!nextOpen) {
			resetForm();
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const amountInCents = toCents(moveAmount);

		if (amountInCents <= 0) {
			setError("Enter an amount greater than 0.");
			return;
		}

		if (amountInCents > availableAmount) {
			setError(`Move amount cannot exceed ${formatCurrency(availableAmount)}.`);
			return;
		}

		if (!toCategoryId) {
			setError("Choose a category to move to.");
			return;
		}

		createCategoryTransfer({
			data: {
				from_category_id: sourceCategoryId,
				to_category_id: toCategoryId,
				amount: amountInCents,
				month: firstDayOfMonth,
			},
		});
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent align="end" className="w-80">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<label htmlFor={`move-${sourceCategoryId}`} className="text-sm font-medium">
							Move
						</label>
						<Input
							id={`move-${sourceCategoryId}`}
							ref={moveInputRef}
							inputMode="decimal"
							placeholder="0.00"
							value={moveAmount}
							onChange={(event) => setMoveAmount(event.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor={`to-${sourceCategoryId}`} className="text-sm font-medium">
							To
						</label>
						<Select value={toCategoryId} onValueChange={setToCategoryId}>
							<SelectTrigger id={`to-${sourceCategoryId}`}>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								{toCategories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					<div className="flex justify-end gap-2 pt-1">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending || toCategories.length === 0}>
							{isPending ? "Moving..." : "Move"}
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
};
