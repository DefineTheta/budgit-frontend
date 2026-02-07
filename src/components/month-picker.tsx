import type React from "react";
import { Button } from "./ui/button";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { addMonths, subMonths } from "date-fns";

interface MonthPickerProps extends React.HTMLAttributes<HTMLDivElement> {
	value: Date;
	setValue: (d: Date) => void;
}

export const MonthPicker = ({
	value,
	setValue,
	className,
	...rest
}: MonthPickerProps) => {
	const month = value.toLocaleDateString("default", { month: "short" });
	const year = value.getFullYear();

	return (
		<div className={cn("flex items-center select-none", className)} {...rest}>
			<CircleChevronLeft
				className="cursor-pointer"
				role="button"
				onClick={() => setValue(subMonths(value, 1))}
			/>
			<span className="w-32 text-center text-2xl font-bold">{`${month} ${year}`}</span>
			<CircleChevronRight
				className="cursor-pointer"
				role="button"
				onClick={() => setValue(addMonths(value, 1))}
			/>
		</div>
	);
};
