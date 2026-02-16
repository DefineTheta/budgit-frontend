import type { Allocation } from "@/features/allocations/config/schemas";
import type { Goal } from "@/features/goals/config/schemas";
import { countDaysInMonth } from "@/helpers/calendar";
import { formatCurrency } from "@/utils/currency";
import { endOfMonth, format, set } from "date-fns";

type GoalProgress = {
	status: "FUNDED" | "UNDERFUNDED" | null;
	overspent: boolean;
	progress: number;
	segments: number;
	text: string;
};

export const calculateMonthlyGoalProgress = (
	year: number,
	monthIndex: number,
	activity: number,
	goal?: Goal | null,
	allocation?: Allocation,
): GoalProgress => {
	const progress: GoalProgress = {
		status: null,
		overspent: false,
		progress: 0,
		segments: 1,
		text: "",
	};

	if (!goal) {
		return progress;
	}

	const weeklyDayIndex = goal.repeat_day_week;
	const monthlyDayIndex = goal.repeat_day_month;
	const goalDate =
		monthlyDayIndex && monthlyDayIndex !== 32
			? set(endOfMonth(new Date(year, monthIndex)), {
					date: monthlyDayIndex,
				})
			: endOfMonth(new Date(year, monthIndex));
	let monthlyRepeat = 1;

	if (weeklyDayIndex !== null) {
		// Map sunday to index 0
		monthlyRepeat = countDaysInMonth(
			year,
			monthIndex,
			weeklyDayIndex === 7 ? 0 : weeklyDayIndex,
		);
	}

	progress.segments = monthlyRepeat;

	const totalGoalAmount = monthlyRepeat * goal.amount;
	const remainingAmount = totalGoalAmount - (allocation?.amount ?? 0);

	if (!allocation) {
		progress.status = "UNDERFUNDED";
	} else if (allocation.amount < totalGoalAmount) {
		progress.status = "UNDERFUNDED";
		progress.progress = (allocation.amount / totalGoalAmount) * 100;
	} else {
		progress.status = "FUNDED";
		progress.progress = 100;
	}

	if (remainingAmount === 0) {
		progress.text = "Funded";
	} else if (weeklyDayIndex) {
		progress.text = `${formatCurrency(remainingAmount)} more needed this month`;
	} else if (monthlyDayIndex) {
		progress.text = `${formatCurrency(remainingAmount)} more needed by the ${format(goalDate, "do")}`;
	}

	if (activity > (allocation?.amount ?? 0)) {
		progress.overspent = true;

		if (!allocation || allocation.amount === 0) {
			progress.text = `Overspent ${formatCurrency(activity)}`;
		} else {
			progress.text = `Overspent ${formatCurrency(activity)} of ${formatCurrency(allocation.amount)}`;
		}
	}

	return progress;
};
