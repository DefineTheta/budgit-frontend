import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from "date-fns";

// Day index is 0 based with 0 being sunday
export const countDaysInMonth = (year: number, monthIndex: number, dayIndex: number) => {
	// Month index is 0 based
	const start = startOfMonth(new Date(year, monthIndex));
	const end = endOfMonth(new Date(year, monthIndex));

	const daysInMonth = eachDayOfInterval({ start, end });

	let count = 0;

	for (const day of daysInMonth) {
		if (getDay(day) === dayIndex) count++;
	}

	return count;
};
