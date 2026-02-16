import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useCreatePayee } from "@/features/payees/api/create-payee";
import { useGetPayees } from "@/features/payees/api/get-payees";
import { cn } from "@/lib/utils";

interface PayeeSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function PayeeSelect({
	value,
	onChange,
	placeholder = "Payee",
	className,
}: PayeeSelectProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	useEffect(() => {
		if (!value) {
			setInputValue("");
		}
	}, [value]);

	const payeesQuery = useGetPayees();
	const payees = payeesQuery.data ?? [];

	const selectedLabel = payees.find((payee) => payee.id === value)?.name;

	const { mutate: createPayee, isPending } = useCreatePayee({
		mutationConfig: {
			onSuccess: (payee) => {
				onChange(payee.id);
				setOpen(false);
				setInputValue("");
			},
		},
	});

	const handleCreatePayee = () => {
		const name = inputValue.trim();
		if (!name || isPending) return;
		createPayee({ data: { name } });
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
			<PopoverContent className="w-[220px] p-0">
				<Command>
					<CommandInput
						placeholder="Search payees..."
						value={inputValue}
						onValueChange={setInputValue}
					/>
					<CommandList>
						<CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
							No payees found.
						</CommandEmpty>
						<CommandGroup>
							{payees.map((payee) => (
								<CommandItem
									key={payee.id}
									value={payee.name}
									onSelect={() => {
										onChange(payee.id);
										setOpen(false);
										setInputValue("");
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === payee.id ? "opacity-100" : "opacity-0",
										)}
									/>
									{payee.name}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<div className="p-2">
							<Button
								variant="secondary"
								size="sm"
								className="h-8 w-full justify-start"
								onClick={handleCreatePayee}
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
										Create "{inputValue.trim() || "new payee"}"
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
