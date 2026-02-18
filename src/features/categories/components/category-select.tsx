import { Check, ChevronsUpDown, Plus, Split } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateCategory } from "@/features/categories/api/create-category";
import { useCategories } from "@/features/categories/api/get-categories";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
	value?: string;
	onChange: (value: string) => void;
	onSplitClick?: () => void;
	showSplitButton?: boolean;
	openRequestId?: number;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function CategorySelect({
	value,
	onChange,
	onSplitClick,
	showSplitButton = true,
	openRequestId,
	disabled = false,
	placeholder = "Category",
	className,
}: CategorySelectProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const triggerRef = useRef<HTMLButtonElement>(null);
	const portalContainer =
		triggerRef.current?.closest("[data-slot='dialog-content']") ?? undefined;

	useEffect(() => {
		if (!value) {
			setInputValue("");
		}
	}, [value]);

	useEffect(() => {
		if (openRequestId === undefined) return;
		if (disabled) return;
		setOpen(true);
	}, [disabled, openRequestId]);

	const categoriesQuery = useCategories();
	const categories = categoriesQuery.data ?? [];

	const selectedLabel = categories.find((category) => category.id === value)?.name;

	const { mutate: createCategory, isPending } = useCreateCategory({
		mutationConfig: {
			onSuccess: (category) => {
				onChange(category.id);
				setOpen(false);
				setInputValue("");
			},
		},
	});

	const handleCreateCategory = () => {
		const name = inputValue.trim();
		if (!name || isPending) return;
		createCategory({ data: { name } });
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			{showSplitButton ? (
				<ButtonGroup className={cn("w-full", className)}>
					<PopoverTrigger asChild>
						<Button
							ref={triggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							disabled={disabled}
							className="h-full flex-1 justify-between"
						>
							{value ? selectedLabel : placeholder}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<Button
						type="button"
						variant="outline"
						className="h-full w-9 shrink-0 px-0"
						onClick={onSplitClick}
						disabled={disabled || !onSplitClick}
						aria-label="Split transaction"
					>
						<Split className="h-4 w-4 rotate-90" />
					</Button>
				</ButtonGroup>
			) : (
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className={cn("w-full justify-between", className)}
					>
						{value ? selectedLabel : placeholder}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
			)}
			<PopoverContent
				container={portalContainer}
				className="w-[var(--radix-popover-trigger-width)] p-0"
			>
				<Command>
					<CommandInput
						placeholder="Search categories..."
						value={inputValue}
						onValueChange={setInputValue}
					/>
					<CommandList>
						<CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
							No categories found.
						</CommandEmpty>
						<CommandGroup>
							{categories.map((category) => (
								<CommandItem
									key={category.id}
									value={category.name}
									onSelect={() => {
										onChange(category.id);
										setOpen(false);
										setInputValue("");
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === category.id ? "opacity-100" : "opacity-0",
										)}
									/>
									{category.name}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<div className="p-2">
							<Button
								variant="secondary"
								size="sm"
								className="h-8 w-full justify-start"
								onClick={handleCreateCategory}
								disabled={!inputValue.trim() || isPending}
							>
								{isPending ? (
									<span className="flex items-center gap-2">
										<span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
										Creating...
									</span>
								) : (
									<span className="flex items-center gap-2">
										<Plus className="h-3 w-3" />
										Create "{inputValue.trim() || "new category"}"
									</span>
								)}
							</Button>
						</div>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
