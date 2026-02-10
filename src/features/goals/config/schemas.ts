import z from "zod";
import { GOAL_TYPE } from "./constants";

export const GoalSchema = z.object({
	id: z.uuid(),
	goal_type: z.union([
		z.literal(GOAL_TYPE.BUILDER),
		z.literal(GOAL_TYPE.SPENDING),
		z.literal(GOAL_TYPE.BALANCE),
	]),
	amount: z.coerce.number(),
	repeat_date_year: z.string().nullable(),
	repeat_day_month: z.number().nullable(),
	repeat_day_week: z.number().nullable(),
});

export const CreateGoalSchema = z.object({
	goal_type_id: z.int().gte(1).lte(3),
	amount: z.number().int(),
	repeat_day_week: z.int().gte(1).lte(7).nullable().optional(),
	repeat_day_month: z.int().gte(1).lte(32).nullable().optional(),
	repeat_date_year: z
		.string()
		.regex(/^\d{2}-\d{2}$/, "Due date must be in MM-DD format")
		.nullable()
		.optional(),
});
export const UpdateGoalSchema = CreateGoalSchema.partial();

export type Goal = z.infer<typeof GoalSchema>;

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
