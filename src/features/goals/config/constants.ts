export const GOAL_TYPE = {
	BUILDER: 1,
	SPENDING: 2,
	BALANCE: 3,
} as const;

export type GoalType = (typeof GOAL_TYPE)[keyof typeof GOAL_TYPE];

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
	[GOAL_TYPE.BUILDER]: "Builder",
	[GOAL_TYPE.SPENDING]: "Spending",
	[GOAL_TYPE.BALANCE]: "Balance",
};
