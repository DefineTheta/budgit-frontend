import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface Option {
	value: string;
	label: string;
}

interface CreatableSelectProps {
	options: Option[];
	value?: string;
	onChange: (value: string) => void;
	onCreate: (label: string) => Promise<Option | void>; // Returns the new item or nothing
	placeholder?: string;
	emptyText?: string;
	className?: string;
}

export function CreatableSelect({
	options,
	value,
	onChange,
	onCreate,
	placeholder = "Select item...",
	emptyText = "No item found.",
	className,
}: CreatableSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");

	// Find the label for the currently selected value
	const selectedLabel = options.find((opt) => opt.value === value)?.label;

	const handleCreate = async () => {
		if (!inputValue) return;

		setIsCreating(true);
		try {
			// 1. Call the parent's create function
			const newItem = await onCreate(inputValue);

			// 2. If parent returns the new item, select it automatically
			if (newItem) {
				onChange(newItem.value);
			}

			// 3. Reset UI state
			setOpen(false);
			setInputValue("");
		} catch (error) {
			console.error("Failed to create item:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
				>
					{value ? selectedLabel : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search or create..."
						value={inputValue}
						onValueChange={setInputValue}
					/>
					<CommandList>
						{/* The 'CommandEmpty' component from cmkd renders when 
               no items match the filter. We use this slot to show our Create button.
            */}
						<CommandEmpty className="py-2 px-2 text-sm">
							{inputValue ? (
								<div className="flex flex-col gap-2">
									<p className="text-muted-foreground text-xs">{emptyText}</p>
									<Button
										variant="secondary"
										size="sm"
										className="h-8 w-full justify-start"
										onClick={handleCreate}
										disabled={isCreating}
									>
										{isCreating ? (
											<span className="flex items-center gap-2">
												<span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
												Creating...
											</span>
										) : (
											<span className="flex items-center gap-2">
												<Plus className="h-3 w-3" />
												Create "{inputValue}"
											</span>
										)}
									</Button>
								</div>
							) : (
								<span className="text-muted-foreground">{emptyText}</span>
							)}
						</CommandEmpty>

						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.label} // Filtering relies on this
									onSelect={(currentLabel) => {
										// We need to map the label back to the value
										const selectedOption = options.find(
											(opt) => opt.label.toLowerCase() === currentLabel.toLowerCase(),
										);
										if (selectedOption) {
											onChange(selectedOption.value);
											setOpen(false);
										}
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>

						<CommandGroup>
							<Button
								variant="secondary"
								size="sm"
								className="h-8 w-full justify-start"
								onClick={handleCreate}
								disabled={isCreating}
							>
								{isCreating ? (
									<span className="flex items-center gap-2">
										<span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
										Creating...
									</span>
								) : (
									<span className="flex items-center gap-2">
										<Plus className="h-3 w-3" />
										Create "{inputValue}"
									</span>
								)}
							</Button>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
