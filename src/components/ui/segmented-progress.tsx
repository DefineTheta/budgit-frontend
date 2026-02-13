import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SegmentedProgressProps {
	value: number;
	max?: number;
	segments?: number;
	className?: string;
	gap?: number;
}

export function SegmentedProgress({
	value,
	max = 100,
	segments = 5,
	className,
	gap = 2,
}: SegmentedProgressProps) {
	const totalProgress = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<div className={cn("flex w-full", className)} style={{ gap: `${gap}px` }}>
			{Array.from({ length: segments }).map((_, i) => {
				const segmentWeight = 100 / segments;
				const segmentStart = i * segmentWeight;
				const segmentEnd = (i + 1) * segmentWeight;

				let segmentValue = 0;

				if (totalProgress >= segmentEnd) {
					segmentValue = 100;
				} else if (totalProgress > segmentStart) {
					segmentValue = ((totalProgress - segmentStart) / segmentWeight) * 100;
				} else {
					segmentValue = 0;
				}

				return (
					<Progress
						key={i}
						value={segmentValue}
						className={cn(
							"h-2 flex-1 transition-all",
							i === 0 && "rounded-r-none",
							i === segments - 1 && "rounded-l-none",
							i > 0 && i < segments - 1 && "rounded-none",
						)}
					/>
				);
			})}
		</div>
	);
}
