import z from "zod";
import { GOAL_TYPE } from "./constants";

export const CategorySchema = z.object({
	id: z.uuid(),
	name: z.string(),

	stats: z
		.object({
			total: z.number(),
		})
		.optional(),
	allocations: z
		.object({
			id: z.uuid(),
			month: z.coerce.date(),
			amount: z.int(),
		})
		.array()
		.optional(),
	goal: z
		.object({
			id: z.int(),
			goal_type: z.union([
				z.literal(GOAL_TYPE.BUILDER),
				z.literal(GOAL_TYPE.SPENDING),
				z.literal(GOAL_TYPE.BALANCE),
			]),
			amount: z.int(),
			due_date: z.coerce.date(),
		})
		.nullable()
		.optional(),
});

export const createCategorySchema = z.object({
	name: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
