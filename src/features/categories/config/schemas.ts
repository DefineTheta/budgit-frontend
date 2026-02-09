import z from "zod";
import { GoalSchema } from "@/features/goals/config/schemas";

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
	goal: GoalSchema.nullable().optional(),
});

export const createCategorySchema = z.object({
	name: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
