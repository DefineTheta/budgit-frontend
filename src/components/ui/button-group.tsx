import * as React from "react";
import { cn } from "@/lib/utils";

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="button-group"
			className={cn(
				"inline-flex w-full items-center [&>button:not(:first-child)]:border-l-0 [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md",
				className,
			)}
			{...props}
		/>
	);
}

export { ButtonGroup };
