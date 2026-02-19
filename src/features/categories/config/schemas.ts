import z from "zod";
import { GoalSchema } from "@/features/goals/config/schemas";

export const CategorySchema = z.object({
	id: z.uuid(),
	name: z.string(),

	stats: z
		.object({
			carry_forward: z.number(),
			moved: z.number(),
			activity: z.number(),
			available: z.number(),
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
export const createCategoryTransferSchema = z.object({
	from_category_id: z.uuid(),
	to_category_id: z.uuid(),
	amount: z.number().int().positive(),
	month: z.string().regex(/^\d{4}-\d{2}-01$/, "Month must be in YYYY-MM-01 format"),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateCategoryTransferInput = z.infer<typeof createCategoryTransferSchema>;
