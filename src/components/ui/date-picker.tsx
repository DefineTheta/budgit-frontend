import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parse } from "date-fns";

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString(undefined, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function isValidDate(date: Date | undefined) {
	if (!date) {
		return false;
	}
	return !isNaN(date.getTime());
}

interface DatePickerInputProps {
	date?: Date;
	onDateChange: (date?: Date) => void;
	inputRef?: React.Ref<HTMLInputElement>;
}

export function DatePickerInput({ date, onDateChange, inputRef }: DatePickerInputProps) {
	const [open, setOpen] = React.useState(false);
	const [month, setMonth] = React.useState<Date | undefined>(date);
	const [value, setValue] = React.useState(formatDate(date));

	return (
		<Field className="mx-auto">
			<InputGroup className="!bg-background">
				<InputGroupInput
					ref={inputRef}
					id="date-required"
					value={value}
					placeholder="June 01, 2025"
					onChange={(e) => {
						const date = parse(e.target.value, "dd/MM/yyyy", new Date());
						setValue(e.target.value);
						if (isValidDate(date)) {
							onDateChange(date);
							setMonth(date);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							setOpen(true);

							const parsedDate = parse(value, "dd/MM/yyyy", new Date());
							if (isValidDate(parsedDate)) {
								onDateChange(parsedDate);
								setMonth(parsedDate);
							}
							return;
						}

						if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

						e.preventDefault();

						const baseDate = date && isValidDate(date) ? new Date(date) : new Date();
						const direction = e.key === "ArrowUp" ? 1 : -1;
						const nextDate = new Date(baseDate);
						nextDate.setDate(baseDate.getDate() + direction);

						onDateChange(nextDate);
						setMonth(nextDate);
						setValue(formatDate(nextDate));

						if (open) {
							e.preventDefault();
							setOpen(false);
						}
					}}
				/>
				<InputGroupAddon align="inline-end">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<InputGroupButton
								id="date-picker"
								variant="ghost"
								size="icon-xs"
								aria-label="Select date"
							>
								<CalendarIcon />
								<span className="sr-only">Select date</span>
							</InputGroupButton>
						</PopoverTrigger>
						<PopoverContent
							className="w-auto overflow-hidden p-0"
							align="end"
							alignOffset={-8}
							sideOffset={10}
						>
							<Calendar
								mode="single"
								selected={date}
								month={month}
								onMonthChange={setMonth}
								onSelect={(date) => {
									onDateChange(date);
									setValue(formatDate(date));
									setOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>
				</InputGroupAddon>
			</InputGroup>
		</Field>
	);
}
